'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedLayout from '@/components/ProtectedLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge, SeverityBadge } from '@/components/StatusBadge';
import { AlertTriangle, FolderOpen } from 'lucide-react';
import api from '@/utils/api';

function AllCasesContent() {
  const router = useRouter();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', category: '', severity: '' });

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
    api.get(`/cases?${params}`).then(res => { setCases(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, [filters]);

  const setFilter = (key, val) => setFilters(p => ({ ...p, [key]: val === 'all' ? '' : val }));

  const displayed = search
    ? cases.filter(c =>
        c.trackingId?.toLowerCase().includes(search.toLowerCase()) ||
        c.department?.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase())
      )
    : cases;

  const escalatedCount = cases.filter(c => c.status === 'Escalated').length;

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">All Cases</h1>
        <p className="text-muted-foreground mt-1">{cases.length} total cases in the system</p>
      </div>

      {escalatedCount > 0 && (
        <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            {escalatedCount} escalated case(s) require immediate attention.
          </p>
        </div>
      )}

      {/* filters */}
      <Card className="mb-5">
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Input placeholder="Search ID, dept, description..." value={search} onChange={e => setSearch(e.target.value)} />

            <Select onValueChange={v => setFilter('status', v)}>
              <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {['New', 'Assigned', 'In Progress', 'Pending', 'Resolved', 'Escalated'].map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={v => setFilter('category', v)}>
              <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {['Safety', 'Policy', 'Facilities', 'HR', 'Other'].map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={v => setFilter('severity', v)}>
              <SelectTrigger><SelectValue placeholder="All Severities" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                {['Low', 'Medium', 'High'].map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {displayed.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <FolderOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No cases match your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Tracking ID</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase">Category</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase">Dept</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase">Severity</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase">Submitted By</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase">Assigned To</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map(c => (
                    <tr
                      key={c._id}
                      className={`border-b last:border-0 cursor-pointer transition-colors ${c.status === 'Escalated' ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}
                      onClick={() => router.push(`/cases/${c._id}`)}
                    >
                      <td className="px-5 py-3 font-mono font-bold text-blue-600 text-xs">{c.trackingId}</td>
                      <td className="px-3 py-3">{c.category}</td>
                      <td className="px-3 py-3">{c.department}</td>
                      <td className="px-3 py-3"><SeverityBadge severity={c.severity} /></td>
                      <td className="px-3 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-3 py-3">{c.isAnonymous ? <span className="text-xs text-muted-foreground italic">Anonymous</span> : (c.submittedBy?.name || '—')}</td>
                      <td className="px-3 py-3">{c.assignedTo?.name || <span className="text-muted-foreground text-xs">Unassigned</span>}</td>
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

export default function AllCasesPage() {
  return (
    <ProtectedLayout requiredRoles={['Secretariat', 'Case Manager', 'Admin']}>
      <AllCasesContent />
    </ProtectedLayout>
  );
}