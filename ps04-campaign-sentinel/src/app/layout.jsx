import './globals.css';

export const metadata = {
  title: 'PS-04 Sentinel | Campaign Anomaly Alerting',
  description: 'Enterprise B2B Campaign Anomaly Detection without Alert Fatigue',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}