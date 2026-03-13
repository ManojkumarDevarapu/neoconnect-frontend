'use client';
import { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '@/utils/api';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

function StatCard({ label, value, color }) {
  return (
    <Card className={`border-l-4 ${color}`}>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}

function AnalyticsContent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/overview').then(res => { setData(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return <p className="text-center text-muted-foreground py-10">Failed to load analytics.</p>;

  const statusData   = data.byStatus.map(d => ({ name: d._id, value: d.count }));
  const categoryData = data.byCategory.map(d => ({ name: d._id, count: d.count }));
  const severityData = data.bySeverity.map(d => ({ name: d._id, value: d.count }));
  const deptData     = data.openByDept;
  const resolved     = data.byStatus.find(s => s._id === 'Resolved')?.count || 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of all cases across the organisation.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Cases" value={data.total}     color="border-blue-500" />
        <StatCard label="Open Cases"  value={data.open}      color="border-amber-500" />
        <StatCard label="Escalated"   value={data.escalated} color="border-red-500" />
        <StatCard label="Resolved"    value={resolved}       color="border-emerald-500" />
      </div>

      {data.hotspots?.length > 0 && (
        <Card className="mb-6 border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" /> Department Hotspots (5+ cases same dept &amp; category)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.hotspots.map((h, i) => (
              <div key={i} className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                <span className="text-sm font-semibold text-red-800">{h._id.department} — {h._id.category}</span>
                <span className="text-sm font-bold text-red-700">{h.count} cases</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Cases by Status</CardTitle></CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-muted-foreground py-10 text-sm">No data</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Cases by Severity</CardTitle></CardHeader>
          <CardContent>
            {severityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={severityData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-muted-foreground py-10 text-sm">No data</p>}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-5">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Cases by Category</CardTitle></CardHeader>
        <CardContent>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-muted-foreground py-10 text-sm">No data</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Open Cases by Department (Heatmap)</CardTitle></CardHeader>
        <CardContent>
          {deptData.length > 0 ? (
            <div className="space-y-2.5">
              {deptData.map((d, i) => {
                const max = deptData[0]?.count || 1;
                const pct = Math.max(15, Math.round((d.count / max) * 100));
                const color =
                  d.highestSeverity === 'High'   ? 'bg-red-500' :
                  d.highestSeverity === 'Medium' ? 'bg-amber-400' :
                                                   'bg-emerald-500';
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-32 text-sm font-medium truncate">{d._id}</span>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-16 text-xs font-semibold text-right">
                      {d.count} {d.highestSeverity === 'High' ? '🔴' : d.highestSeverity === 'Medium' ? '🟡' : '🟢'}
                    </span>
                  </div>
                );
              })}
              <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-emerald-500"></span> Low severity</span>
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-amber-400"></span> Medium severity</span>
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-red-500"></span> High severity</span>
              </div>
            </div>
          ) : <p className="text-center text-muted-foreground py-10 text-sm">No open cases</p>}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <ProtectedLayout requiredRoles={['Secretariat', 'Admin']}>
      <AnalyticsContent />
    </ProtectedLayout>
  );
}