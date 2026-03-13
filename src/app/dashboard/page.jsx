'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedLayout from '@/components/ProtectedLayout';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, SeverityBadge } from '@/components/StatusBadge';
import { AlertTriangle, TrendingUp, FolderOpen, CheckCircle, PlusCircle } from 'lucide-react';
import api from '@/utils/api';

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <Card className={`border-l-4 ${color}`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          <div className="opacity-20">
            <Icon className="h-10 w-10" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/cases').then(res => { setCases(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const total = cases.length;
  const open = cases.filter(c => c.status !== 'Resolved').length;
  const escalated = cases.filter(c => c.status === 'Escalated').length;
  const resolved = cases.filter(c => c.status === 'Resolved').length;

  const recent = [...cases].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening on NeoConnect today.</p>
      </div>

      {/* quick submit banner */}
      <div className="mb-6 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 p-5 flex items-center justify-between">
        <div>
          <p className="text-white font-semibold text-base">Have an issue to raise?</p>
          <p className="text-blue-100 text-sm mt-0.5">Every submission gets a unique tracking ID. Anonymous option available.</p>
        </div>
        <Button variant="secondary" className="shrink-0" onClick={() => router.push('/submit')}>
          <PlusCircle className="h-4 w-4 mr-1" /> Submit Case
        </Button>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Cases"  value={total}    icon={FolderOpen}    color="border-blue-500" />
        <StatCard label="Open Cases"   value={open}     icon={TrendingUp}    color="border-amber-500" />
        <StatCard label="Escalated"    value={escalated} icon={AlertTriangle} color="border-red-500" />
        <StatCard label="Resolved"     value={resolved} icon={CheckCircle}   color="border-emerald-500" />
      </div>

      {/* escalation alert */}
      {escalated > 0 && (
        <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">
            <strong>{escalated} case(s)</strong> have been escalated due to no response within 7 working days. Immediate attention required.
          </p>
        </div>
      )}

      {/* recent cases table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Recent Cases</CardTitle>
          <Button variant="outline" size="sm" onClick={() => router.push(user?.role === 'Staff' ? '/my-cases' : '/all-cases')}>
            View All
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {recent.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FolderOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No cases yet</p>
              <p className="text-sm">Submit a case to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">ID</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Category</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Dept</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Severity</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map(c => (
                    <tr key={c._id} className="border-b last:border-0 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => router.push(`/cases/${c._id}`)}>
                      <td className="px-5 py-3 font-mono font-semibold text-blue-600 text-xs">{c.trackingId}</td>
                      <td className="px-3 py-3">{c.category}</td>
                      <td className="px-3 py-3">{c.department}</td>
                      <td className="px-3 py-3"><SeverityBadge severity={c.severity} /></td>
                      <td className="px-3 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-3 py-3 text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedLayout>
      <DashboardContent />
    </ProtectedLayout>
  );
}