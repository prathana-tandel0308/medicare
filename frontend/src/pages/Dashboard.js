import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import API from '../utils/api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const STATUS_COLORS = { Active: '#10b981', Discharged: '#f59e0b', Critical: '#f43f5e' };

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/dashboard/stats').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /><span>Loading dashboard...</span></div>;
  if (!data) return <div className="empty-state"><div className="empty-icon">⚠</div><p>Could not load dashboard data. Check your database connection.</p></div>;

  const { stats, recentPatients, recentAppointments, monthlyStats, statusDist } = data;

  const chartData = monthlyStats.map(m => ({ name: MONTHS[m._id.month - 1], appointments: m.count }));
  const pieData = statusDist.map(s => ({ name: s._id, value: s.count }));

  const statCards = [
    { label: 'Total Patients', value: stats.totalPatients, icon: '◉', sub: `${stats.activePatients} active`, accent: '#00d4ff', iconBg: 'rgba(0,212,255,0.1)' },
    { label: 'Active Doctors', value: stats.totalDoctors, icon: '⚕', sub: 'Currently on duty', accent: '#10b981', iconBg: 'rgba(16,185,129,0.1)' },
    { label: 'Today\'s Appointments', value: stats.todayAppointments, icon: '◷', sub: 'Scheduled today', accent: '#f59e0b', iconBg: 'rgba(245,158,11,0.1)' },
    { label: 'Total Appointments', value: stats.totalAppointments, icon: '◈', sub: 'All time', accent: '#8b5cf6', iconBg: 'rgba(139,92,246,0.1)' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Overview</h2>
          <p>Real-time hospital management metrics</p>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map(card => (
          <div key={card.label} className="stat-card" style={{ '--card-accent': card.accent }}>
            <div className="stat-icon" style={{ '--icon-bg': card.iconBg }}>{card.icon}</div>
            <div className="stat-label">{card.label}</div>
            <div className="stat-value">{card.value}</div>
            <div className="stat-sub">{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="section-header">
            <div className="section-title">Monthly Appointments</div>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#4a6580" fontSize={11} />
                <YAxis stroke="#4a6580" fontSize={11} />
                <Tooltip contentStyle={{ background: '#0d1f35', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, color: '#e8f4f8', fontSize: 12 }} />
                <Line type="monotone" dataKey="appointments" stroke="#00d4ff" strokeWidth={2} dot={{ r: 4, fill: '#00d4ff' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '30px 0' }}><p>No appointment data yet</p></div>
          )}
        </div>

        <div className="card">
          <div className="section-header">
            <div className="section-title">Patient Status Distribution</div>
          </div>
          {pieData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieData.map(entry => <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#4a6580'} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0d1f35', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, color: '#e8f4f8', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pieData.map(entry => (
                  <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem' }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: STATUS_COLORS[entry.name], display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{entry.name}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600, marginLeft: 'auto' }}>{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '30px 0' }}><p>No patient data yet</p></div>
          )}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-header"><div className="section-title">Recent Patients</div></div>
          {recentPatients.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {recentPatients.map(p => (
                <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(0,212,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>
                    {p.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{p.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{p.patientId}</div>
                  </div>
                  <span className={`badge badge-${p.status?.toLowerCase()}`}>{p.status}</span>
                </div>
              ))}
            </div>
          ) : <div className="empty-state" style={{ padding: '20px 0' }}><p>No patients yet</p></div>}
        </div>

        <div className="card">
          <div className="section-header"><div className="section-title">Recent Appointments</div></div>
          {recentAppointments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {recentAppointments.map(a => (
                <div key={a._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{a.patient?.name || 'Unknown'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.doctor?.name} · {a.time}</div>
                  </div>
                  <span className={`badge badge-${a.status?.toLowerCase().replace(' ', '-')}`}>{a.status}</span>
                </div>
              ))}
            </div>
          ) : <div className="empty-state" style={{ padding: '20px 0' }}><p>No appointments yet</p></div>}
        </div>
      </div>
    </div>
  );
}
