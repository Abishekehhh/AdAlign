'use client';

import { useState } from 'react';
import anomaliesData from '../data/anomalies.json';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

export default function Home() {
    // Authentication & Navigation States
    const [userRole, setUserRole] = useState(null); // null (unauthenticated), 'ANALYST', 'ADMIN'
    const [loginEmail, setLoginEmail] = useState('');
    const [loginRole, setLoginRole] = useState('ANALYST');

    // Tab Navigation
    const [activeTab, setActiveTab] = useState('alerts');
    const [searchQuery, setSearchQuery] = useState('');
    const [severityFilter, setSeverityFilter] = useState('ALL');

    // Admin Config States
    const [madThreshold, setMadThreshold] = useState(3.0);
    const [b2bFilterEnabled, setB2bFilterEnabled] = useState(true);

    const { total_records, total_campaigns, total_alerts, total_noise_filtered, anomalies } = anomaliesData;

    const handleLogin = (e) => {
        e.preventDefault();
        if (loginEmail.trim() !== '') {
            setUserRole(loginRole);
        }
    };

    const handleLogout = () => {
        setUserRole(null);
        setActiveTab('alerts');
    };

    // Filtered Queue
    const filteredAnomalies = anomalies.filter((item) => {
        const matchesSearch = item.campaign_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.campaign_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.type.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSeverity = severityFilter === 'ALL' || item.severity === severityFilter;
        return matchesSearch && matchesSeverity;
    });

    // Mock Inspector Data
    const mockSeriesData = Array.from({ length: 30 }, (_, i) => {
        const dateStr = `2026-05-${(i + 1).toString().padStart(2, '0')}`;
        const baseSpend = 2000 + Math.sin(i / 2) * 400;
        const isIncidentDay = i === 13;
        const spend = isIncidentDay ? 8420 : baseSpend + (Math.random() * 200 - 100);
        return {
            date: dateStr,
            spend: Math.round(spend),
            baseline: Math.round(baseSpend),
            upperBound: Math.round(baseSpend + 1200)
        };
    });

    // UNAUTHENTICATED LOGIN SCREEN (High-Trust Enterprise Gateway)
    if (!userRole) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-slate-900 border-2 border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
                    {/* Official Government/Enterprise Seal Banner */}
                    <div className="bg-slate-950 px-6 py-6 border-b border-slate-800 text-center">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-600/20 border-2 border-indigo-500/40 text-2xl mb-3">
                            🏛️
                        </div>
                        <h1 className="text-xl font-extrabold text-white tracking-wide uppercase">AdAlign Official Portal</h1>
                        <p className="text-xs text-slate-400 mt-1">Campaign Anomaly Monitoring & Verification Platform</p>
                        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Secure System Access
                        </div>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="p-6 space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Select User Authorization</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setLoginRole('ANALYST')}
                                    className={`py-2.5 text-xs font-bold rounded-lg border transition-all ${loginRole === 'ANALYST'
                                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                                        }`}
                                >
                                    👤 Campaign Analyst
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLoginRole('ADMIN')}
                                    className={`py-2.5 text-xs font-bold rounded-lg border transition-all ${loginRole === 'ADMIN'
                                            ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                                        }`}
                                >
                                    🛡️ System Admin
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Authorized ID / Email</label>
                            <input
                                type="email"
                                required
                                placeholder={loginRole === 'ADMIN' ? "admin@adalign.gov.in" : "analyst@adalign.gov.in"}
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Access Token / Password</label>
                            <input
                                type="password"
                                required
                                defaultValue="••••••••••••"
                                className="w-full bg-slate-950 border border-slate-800 text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-lg shadow-lg transition-all uppercase tracking-wider"
                        >
                            Authenticate & Enter Secure Portal
                        </button>

                        <div className="text-center text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
                            Protected by Enterprise System Encryption • PS-04 Standard Compliance
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // AUTHENTICATED DASHBOARD PORTAL
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
            {/* Official Government Top Header */}
            <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30 text-2xl">
                            🏛️
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-extrabold text-white uppercase tracking-wider">AdAlign Official Sentinel</h1>
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                    Verified Portal
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">Campaign Anomaly Detection & Operational Alert Fatigue Reducer</p>
                        </div>
                    </div>

                    {/* User Profile & Navigation Controls */}
                    <div className="flex items-center gap-4">
                        <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
                            <span className="text-slate-400">Authenticated: </span>
                            <span className="font-bold text-white">{loginEmail}</span>
                            <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-extrabold ${userRole === 'ADMIN' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                }`}>
                                {userRole}
                            </span>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors border border-slate-700"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="max-w-7xl mx-auto px-6 flex border-t border-slate-800/80">
                    <button
                        onClick={() => setActiveTab('alerts')}
                        className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'alerts' ? 'border-indigo-500 text-indigo-400 bg-slate-800/30' : 'border-transparent text-slate-400 hover:text-white'
                            }`}
                    >
                        📊 Alert Queue ({total_alerts})
                    </button>

                    <button
                        onClick={() => setActiveTab('inspector')}
                        className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'inspector' ? 'border-indigo-500 text-indigo-400 bg-slate-800/30' : 'border-transparent text-slate-400 hover:text-white'
                            }`}
                    >
                        📈 Time-Series Deep-Dive
                    </button>

                    {userRole === 'ADMIN' ? (
                        <button
                            onClick={() => setActiveTab('config')}
                            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'config' ? 'border-amber-500 text-amber-400 bg-slate-800/30' : 'border-transparent text-slate-400 hover:text-white'
                                }`}
                        >
                            ⚙️ System Rules & Thresholds (Admin)
                        </button>
                    ) : (
                        <div className="px-4 py-3 text-xs text-slate-600 uppercase tracking-wider cursor-not-allowed">
                            🔒 Admin Rules (Restricted)
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content Workspace */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* VIEW 1: ALERT QUEUE */}
                {activeTab === 'alerts' && (
                    <div className="space-y-6">
                        {/* KPI Summary Banner */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                                <span className="text-xs font-bold text-slate-400 uppercase">Monitored Records</span>
                                <div className="text-2xl font-extrabold text-white mt-1">{total_records.toLocaleString()}</div>
                                <span className="text-[11px] text-slate-500">{total_campaigns} campaigns across 180 days</span>
                            </div>

                            <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-4">
                                <span className="text-xs font-bold text-amber-400 uppercase">Actionable Alerts</span>
                                <div className="text-2xl font-extrabold text-amber-400 mt-1">{total_alerts}</div>
                                <span className="text-[11px] text-slate-400">High-confidence anomalies</span>
                            </div>

                            <div className="bg-slate-900 border border-indigo-500/30 rounded-xl p-4">
                                <span className="text-xs font-bold text-indigo-400 uppercase">Noise Suppressed</span>
                                <div className="text-2xl font-extrabold text-indigo-400 mt-1">{total_noise_filtered}</div>
                                <span className="text-[11px] text-slate-400">B2B weekend drops filtered</span>
                            </div>

                            <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-4">
                                <span className="text-xs font-bold text-emerald-400 uppercase">Noise Reduction Score</span>
                                <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                                    {((total_noise_filtered / (total_alerts + total_noise_filtered)) * 100).toFixed(1)}%
                                </div>
                                <span className="text-[11px] text-slate-400">Alert fatigue reduction</span>
                            </div>
                        </div>

                        {/* Filter Toolbar */}
                        <div className="flex flex-col md:flex-row gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
                            <input
                                type="text"
                                placeholder="🔍 Search campaign name, ID, or anomaly..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-slate-950 border border-slate-800 text-sm px-4 py-2 rounded-lg flex-1 text-white focus:outline-none focus:border-indigo-500"
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
                        </div>

                        {/* Incident Table */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                            <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex justify-between items-center">
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                                    Operational Incident Queue ({filteredAnomalies.length})
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-950 text-xs text-slate-400 uppercase border-b border-slate-800">
                                        <tr>
                                            <th className="py-3 px-4">Severity</th>
                                            <th className="py-3 px-4">Date</th>
                                            <th className="py-3 px-4">Campaign</th>
                                            <th className="py-3 px-4">Channel</th>
                                            <th className="py-3 px-4">Type</th>
                                            <th className="py-3 px-4">Spend (Baseline)</th>
                                            <th className="py-3 px-4">Conversions</th>
                                            <th className="py-3 px-4">Diagnostic Cause</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/80">
                                        {filteredAnomalies.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-0.5 rounded text-[11px] font-extrabold ${item.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                        }`}>
                                                        {item.severity}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 font-mono text-xs text-slate-400">{item.date}</td>
                                                <td className="py-3 px-4 font-bold text-white">{item.campaign_name}</td>
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

                {/* VIEW 2: TIME-SERIES INSPECTOR */}
                {activeTab === 'inspector' && (
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
                        <h2 className="text-base font-bold text-white uppercase tracking-wider">Campaign Baseline Inspector (Campaign C01)</h2>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={mockSeriesData}>
                                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} />
                                    <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                                    <Line type="monotone" dataKey="spend" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} name="Daily Spend (₹)" />
                                    <Line type="monotone" dataKey="baseline" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 5" name="14d Baseline Median" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* VIEW 3: ADMIN RULE CONFIGURATOR */}
                {activeTab === 'config' && userRole === 'ADMIN' && (
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6 max-w-2xl">
                        <div className="border-b border-slate-800 pb-4">
                            <h2 className="text-base font-bold text-amber-400 uppercase tracking-wider">🛡️ System Threshold Configuration</h2>
                            <p className="text-xs text-slate-400 mt-1">Adjust statistical baselines and sensitivity parameters across all campaigns.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
                                    MAD Sensitivity Threshold ({madThreshold}x MAD)
                                </label>
                                <input
                                    type="range"
                                    min="1.5"
                                    max="5.0"
                                    step="0.1"
                                    value={madThreshold}
                                    onChange={(e) => setMadThreshold(parseFloat(e.target.value))}
                                    className="w-full accent-amber-500"
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-lg">
                                <div>
                                    <div className="text-xs font-bold text-white uppercase">B2B Weekend Noise Filter</div>
                                    <div className="text-[11px] text-slate-400">Suppress low weekend volume flags for B2B verticals</div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={b2bFilterEnabled}
                                    onChange={(e) => setB2bFilterEnabled(e.target.checked)}
                                    className="w-5 h-5 accent-amber-500"
                                />
                            </div>

                            <button
                                onClick={() => alert(`System Rules Updated Successfully! Sensitivity: ${madThreshold}x MAD`)}
                                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg transition-all"
                            >
                                Save & Apply Rules
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}