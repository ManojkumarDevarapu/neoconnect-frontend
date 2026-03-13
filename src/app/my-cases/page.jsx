'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedLayout from '@/components/ProtectedLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, SeverityBadge } from '@/components/StatusBadge';
import { FileText } from 'lucide-react';
import api from '@/utils/api';

const STATUSES = ['New', 'Assigned', 'In Progress', 'Pending', 'Resolved', 'Escalated'];

function MyCasesContent() {
  const router = useRouter();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    api.get('/cases').then(res => { setCases(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const displayed = filter ? cases.filter(c => c.status === filter) : cases;

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Submissions</h1>
        <p className="text-muted-foreground mt-1">Track the progress of cases you have submitted.</p>
      </div>

      {/* filter buttons */}
      <div className="flex flex-wrap gap-2 mb-5">
        <Button size="sm" variant={filter === '' ? 'default' : 'outline'} onClick={() => setFilter('')}>All</Button>
        {STATUSES.map(s => (
          <Button key={s} size="sm" variant={filter === s ? 'default' : 'outline'} onClick={() => setFilter(s)}>{s}</Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {displayed.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium text-gray-700">No cases found</p>
              <p className="text-sm mb-4">You haven&apos;t submitted any cases yet.</p>
              <Button onClick={() => router.push('/submit')}>Submit a Case</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Tracking ID</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase">Category</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase">Department</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase">Severity</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase">Assigned To</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map(c => (
                    <tr key={c._id} className="border-b last:border-0 hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/cases/${c._id}`)}>
                      <td className="px-5 py-3 font-mono font-bold text-blue-600 text-xs">{c.trackingId}</td>
                      <td className="px-3 py-3">{c.category}</td>
                      <td className="px-3 py-3">{c.department}</td>
                      <td className="px-3 py-3"><SeverityBadge severity={c.severity} /></td>
                      <td className="px-3 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-3 py-3">{c.assignedTo?.name || <span className="text-muted-foreground text-xs">Not assigned</span>}</td>
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

export default function MyCasesPage() {
  return <ProtectedLayout><MyCasesContent /></ProtectedLayout>;
}