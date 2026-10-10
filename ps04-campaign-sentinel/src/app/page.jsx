'use client';

import { useState } from 'react';
import anomaliesData from '../data/anomalies.json';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceArea 
} from 'recharts';

export default function Home() {
  const [activeTab, setActiveTab] = useState('alerts');
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [selectedCampaign, setSelectedCampaign] = useState('C01');
  const [madThreshold, setMadThreshold] = useState(3.0);
  const [b2bMode, setB2bMode] = useState(true);

  const { total_records, total_campaigns, total_alerts, total_noise_filtered, anomalies } = anomaliesData;

  // Filtered Anomalies Queue
  const filteredAnomalies = anomalies.filter((item) => {
    const matchesSearch = item.campaign_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.campaign_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || item.severity === severityFilter;
    const matchesChannel = channelFilter === 'ALL' || item.channel === channelFilter;
    return matchesSearch && matchesSeverity && matchesChannel;
  });

  // Mock time series data for Campaign Inspector
  const mockSeriesData = Array.from({ length: 30 }, (_, i) => {
    const dateStr = `2026-05-${(i + 1).toString().padStart(2, '0')}`;
    const baseSpend = 2000 + Math.sin(i / 2) * 400;
    const isIncidentDay = i === 13; // May 14
    const spend = isIncidentDay ? 8420 : baseSpend + (Math.random() * 200 - 100);
    return {
      date: dateStr,
      spend: Math.round(spend),
      baseline: Math.round(baseSpend),
      upperBound: Math.round(baseSpend + 1200),
      lowerBound: Math.max(0, Math.round(baseSpend - 1200)),
      isWeekend: (i % 7 === 5 || i % 7 === 6)
    };
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6">
      {/* Top Global Navigation */}
      <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30 text-xl font-bold">
            🛡️
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">PS-04 Sentinel</h1>
            <p className="text-xs text-slate-400">Campaign Anomaly Detection & Alert Fatigue Reducer</p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'alerts'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📊 Alert Center
          </button>
          <button
            onClick={() => setActiveTab('inspector')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'inspector'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📈 Campaign Inspector
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'config'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚙️ Engine Tuner
          </button>
        </div>
      </header>

      {/* PAGE 1: EXECUTIVE ALERT CENTER */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Monitored Records</p>
              <div className="text-3xl font-extrabold text-white">{total_records.toLocaleString()}</div>
              <p className="text-xs text-slate-500 mt-1">{total_campaigns} Active Campaigns (180 Days)</p>
            </div>

            <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-5">
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Actionable Alerts</p>
              <div className="text-3xl font-extrabold text-amber-400">{total_alerts}</div>
              <p className="text-xs text-slate-400 mt-1">High-confidence anomalies flagged</p>
            </div>

            <div className="bg-slate-900 border border-indigo-500/30 rounded-xl p-5">
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">B2B Noise Filtered</p>
              <div className="text-3xl font-extrabold text-indigo-400">{total_noise_filtered}</div>
              <p className="text-xs text-slate-400 mt-1">Weekend drops suppressed</p>
            </div>

            <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-5">
              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Fatigue Reduction Ratio</p>
              <div className="text-3xl font-extrabold text-emerald-400">
                {((total_noise_filtered / (total_alerts + total_noise_filtered)) * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-slate-400 mt-1">Noise eliminated ratio</p>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <input
              type="text"
              placeholder="🔍 Search campaign, ID, or anomaly type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-sm px-4 py-2 rounded-lg flex-1 focus:outline-none focus:border-indigo-500"
            />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-sm px-4 py-2 rounded-lg text-slate-300"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="WARNING">Warning Only</option>
            </select>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-sm px-4 py-2 rounded-lg text-slate-300"
            >
              <option value="ALL">All Channels</option>
              <option value="Google">Google Ads</option>
              <option value="Meta">Meta Ads</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="TikTok">TikTok</option>
            </select>
          </div>

          {/* Incident Queue Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-base font-bold text-white">Actionable Incident Queue ({filteredAnomalies.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-xs text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Campaign</th>
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4">Anomaly Type</th>
                    <th className="py-3 px-4">Spend (Baseline)</th>
                    <th className="py-3 px-4">Conversions</th>
                    <th className="py-3 px-4">Plain-English Cause & Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredAnomalies.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          item.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {item.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-400">{item.date}</td>
                      <td className="py-3 px-4 font-medium text-white">{item.campaign_name}</td>
                      <td className="py-3 px-4 text-xs text-slate-400">{item.channel}</td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-800 px-2 py-1 rounded text-xs text-slate-300">
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">
                        <span className="text-rose-400 font-bold">₹{item.spend.toLocaleString()}</span>
                        <span className="text-slate-500 ml-1">(₹{item.baseline_spend.toLocaleString()})</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">
                        {item.conversions === 0 ? (
                          <span className="text-rose-400 font-extrabold">0 🚨</span>
                        ) : (
                          <span className="text-slate-300">{item.conversions}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-300 max-w-sm">
                        {item.explanation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PAGE 2: CAMPAIGN DEEP-DIVE INSPECTOR */}
      {activeTab === 'inspector' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Campaign Time-Series Inspector</h2>
              <p className="text-xs text-slate-400">Inspect rolling 14-day MAD baseline bounds (±3σ) and anomaly triggers</p>
            </div>
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-sm px-4 py-2 rounded-lg text-white"
            >
              {Array.from({ length: 20 }, (_, i) => {
                const id = `C${(i + 1).toString().padStart(2, '0')}`;
                return <option key={id} value={id}>Campaign {id}</option>;
              })}
            </select>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Daily Spend vs 14-Day Baseline Range</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockSeriesData}>
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Line type="monotone" dataKey="spend" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} name="Actual Spend (₹)" />
                  <Line type="monotone" dataKey="baseline" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 5" name="14d Rolling Median" />
                  <Line type="monotone" dataKey="upperBound" stroke="#334155" strokeWidth={1} name="Upper Baseline Bound" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* PAGE 3: ENGINE SENSITIVITY TUNER */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h2 className="text-lg font-bold text-white mb-2">Engine Rules & Sensitivity Configuration</h2>
            <p className="text-xs text-slate-400 mb-6">Tune detection sensitivity thresholds to reduce false alarms and eliminate alert fatigue.</p>

            <div className="space-y-6 max-w-xl">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">
                  MAD Multiplier Sensitivity ({madThreshold}x MAD)
                </label>
                <input
                  type="range"
                  min="1.5"
                  max="5.0"
                  step="0.1"
                  value={madThreshold}
                  onChange={(e) => setMadThreshold(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <p className="text-xs text-slate-500 mt-1">Higher values require larger spikes before triggering spend alerts.</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-slate-800">
                <div>
                  <div className="text-sm font-semibold text-white">B2B Weekend Noise Filter</div>
                  <div className="text-xs text-slate-400">Suppress expected weekend drop alerts for B2B verticals</div>
                </div>
                <input
                  type="checkbox"
                  checked={b2bMode}
                  onChange={(e) => setB2bMode(e.target.checked)}
                  className="w-5 h-5 accent-indigo-500 rounded"
                />
              </div>

              <button
                onClick={() => alert(`Engine Configured: ${madThreshold}x MAD sensitivity, B2B Filter: ${b2bMode ? 'ENABLED' : 'DISABLED'}`)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-lg transition-all"
              >
                💾 Save Configuration & Re-run Engine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}