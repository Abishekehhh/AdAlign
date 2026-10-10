import pandas as pd
import numpy as np
import json
from pathlib import Path

def calculate_mad(series):
    median = series.median()
    return np.median(np.abs(series - median))

def run_detection(data_path="data/daily_campaign_metrics.csv", output_path="src/data/anomalies.json"):
    data_file = Path(data_path)
    if not data_file.exists():
        print(f"❌ Error: Could not find '{data_path}'. Please place daily_campaign_metrics.csv in the data/ folder.")
        return

    df = pd.read_csv(data_file)
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values(['campaign_id', 'date']).reset_index(drop=True)
    
    df['day_of_week'] = df['date'].dt.dayofweek
    df['is_weekend'] = df['day_of_week'].isin([5, 6])
    
    anomalies = []
    total_raw_deviations = 0
    total_suppressed_noise = 0
    
    # Process each campaign independently
    for campaign_id, group in df.groupby('campaign_id'):
        group = group.copy().reset_index(drop=True)
        
        # Calculate 14-day rolling median & MAD for spend
        group['spend_median_14d'] = group['spend'].shift(1).rolling(window=14, min_periods=7).median()
        group['spend_mad_14d'] = group['spend'].shift(1).rolling(window=14, min_periods=7).apply(calculate_mad, raw=False)
        
        for idx, row in group.iterrows():
            if pd.isna(row['spend_median_14d']):
                continue
            
            spend_med = row['spend_median_14d']
            spend_mad = max(row['spend_mad_14d'], 100.0)  # Floor MAD to prevent division by zero
            
            # Robust Z-score via MAD
            spend_z = (row['spend'] - spend_med) / (1.4826 * spend_mad)
            
            # B2B Weekend Rule: Suppress spend drop alerts on weekends for B2B verticals
            is_b2b = 'b2b' in str(row['vertical']).lower() or 'b2b' in str(row['campaign_name']).lower()
            if is_b2b and row['is_weekend'] and spend_z < -1.5:
                total_suppressed_noise += 1
                continue
                
            # Rule 1: Zero-Conversion Trap (Spend > 1.5x median, 0 conversions, median spend > 500)
            if row['spend'] > spend_med * 1.5 and row['conversions'] == 0 and spend_med > 500:
                total_raw_deviations += 1
                anomalies.append({
                    "id": f"ALERT-{len(anomalies)+1:03d}",
                    "date": row['date'].strftime('%Y-%m-%d'),
                    "campaign_id": row['campaign_id'],
                    "campaign_name": row['campaign_name'],
                    "channel": row['channel'],
                    "vertical": row['vertical'],
                    "severity": "CRITICAL",
                    "type": "Zero-Conversion Trap",
                    "spend": float(row['spend']),
                    "baseline_spend": float(round(spend_med, 2)),
                    "conversions": int(row['conversions']),
                    "explanation": f"Spend surged to ₹{row['spend']:,.0f} (+{((row['spend']/spend_med)-1)*100:.1f}% vs 14d median ₹{spend_med:,.0f}) but conversions dropped to 0. Suspected broken conversion tracking tag or broken landing page."
                })
            
            # Rule 2: Unusually High Spend Spike
            elif spend_z > 3.0:
                total_raw_deviations += 1
                anomalies.append({
                    "id": f"ALERT-{len(anomalies)+1:03d}",
                    "date": row['date'].strftime('%Y-%m-%d'),
                    "campaign_id": row['campaign_id'],
                    "campaign_name": row['campaign_name'],
                    "channel": row['channel'],
                    "vertical": row['vertical'],
                    "severity": "WARNING",
                    "type": "Spend Spike",
                    "spend": float(row['spend']),
                    "baseline_spend": float(round(spend_med, 2)),
                    "conversions": int(row['conversions']),
                    "explanation": f"Daily spend spiked to ₹{row['spend']:,.0f}, which is {spend_z:.1f}x MAD above the 14-day rolling baseline (₹{spend_med:,.0f})."
                })

    output_dir = Path(output_path).parent
    output_dir.mkdir(parents=True, exist_ok=True)
    
    summary = {
        "total_records": len(df),
        "total_campaigns": int(df['campaign_id'].nunique()),
        "total_alerts": len(anomalies),
        "total_noise_filtered": total_suppressed_noise,
        "anomalies": anomalies
    }
    
    with open(output_path, "w") as f:
        json.dump(summary, f, indent=2)
        
    print(f"\n SUCCESS! Detection complete.")
    print(f" Total Records Processed: {len(df)}")
    print(f" Actionable Alerts Flagged: {len(anomalies)}")
    print(f" B2B Weekend Noise Filtered: {total_suppressed_noise}")
    print(f" Saved results to: {output_path}")

if __name__ == "__main__":
    run_detection()