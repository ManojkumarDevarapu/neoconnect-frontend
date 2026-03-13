'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProtectedLayout from '@/components/ProtectedLayout';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge, SeverityBadge } from '@/components/StatusBadge';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Paperclip, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/utils/api';

function InfoRow({ label, value }) {
  return (
    <div className="flex py-3 border-b border-gray-50 last:border-0">
      <span className="w-36 text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0">{label}</span>
      <span className="text-sm">{value || '—'}</span>
    </div>
  );
}

function CaseDetailContent() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [caseData, setCaseData] = useState(null);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedManager, setSelectedManager] = useState('');
  const [assigning, setAssigning] = useState(false);

  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [whatChanged, setWhatChanged] = useState('');
  const [makePublic, setMakePublic] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    api.get(`/cases/${id}`)
      .then(res => { setCaseData(res.data); setNewStatus(res.data.status); setLoading(false); })
      .catch(() => { toast.error('Case not found'); router.push('/dashboard'); });

    if (['Secretariat', 'Admin'].includes(user?.role)) {
      api.get('/users?role=Case Manager').then(res => setManagers(res.data));
    }
  }, [id]);

  const handleAssign = async () => {
    if (!selectedManager) { toast.error('Select a case manager'); return; }
    setAssigning(true);
    try {
      const res = await api.patch(`/cases/${id}/assign`, { assignedTo: selectedManager });
      setCaseData(p => ({ ...p, ...res.data }));
      toast.success('Case assigned');
    } catch { toast.error('Failed to assign'); }
    finally { setAssigning(false); }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const res = await api.patch(`/cases/${id}/status`, {
        status: newStatus,
        note: note || undefined,
        actionTaken: actionTaken || undefined,
        whatChanged: whatChanged || undefined,
        isPublic: makePublic
      });
      setCaseData(p => ({ ...p, ...res.data }));
      setNote('');
      toast.success('Case updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setUpdating(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!caseData) return null;

  const canManage = ['Secretariat', 'Admin'].includes(user?.role) ||
    (user?.role === 'Case Manager' && String(caseData.assignedTo?._id) === String(user?._id));

  const daysOpen = Math.floor((Date.now() - new Date(caseData.createdAt)) / 86400000);

  return (
    <div className="max-w-5xl mx-auto">
      {/* header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-black text-xl text-blue-700">{caseData.trackingId}</span>
            <StatusBadge status={caseData.status} />
            <SeverityBadge severity={caseData.severity} />
            {caseData.escalated && (
              <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
                <AlertTriangle className="h-3 w-3" /> ESCALATED
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Submitted {new Date(caseData.createdAt).toLocaleDateString()} · {daysOpen} day(s) open
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* left — case info + notes */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Case Details</CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow label="Category"     value={caseData.category} />
              <InfoRow label="Department"   value={caseData.department} />
              <InfoRow label="Location"     value={caseData.location} />
              <InfoRow label="Submitted by" value={caseData.isAnonymous ? '🕵️ Anonymous' : caseData.submittedBy?.name} />
              <InfoRow label="Assigned to"  value={caseData.assignedTo?.name} />

              <div className="mt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Description</p>
                <p className="text-sm leading-relaxed text-gray-700">{caseData.description}</p>
              </div>

              {caseData.attachments?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Attachments</p>
                  {caseData.attachments.map((a, i) => (
                    <a key={i} href={`http://localhost:5000${a.path}`} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:underline bg-blue-50 rounded-lg px-3 py-2 mb-1">
                      <Paperclip className="h-4 w-4" /> {a.originalName}
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* activity / notes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Activity & Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {caseData.notes?.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">No notes yet</p>
              )}
              <div className="space-y-3">
                {caseData.notes?.map((n, i) => (
                  <div key={i} className={`rounded-lg p-3 text-sm border-l-4 ${n.isSystem ? 'bg-amber-50 border-amber-400' : 'bg-gray-50 border-gray-300'}`}>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span className="font-semibold">{n.isSystem ? '⚙️ System' : (n.addedBy?.name || 'User')}</span>
                      <span>{new Date(n.addedAt).toLocaleString()}</span>
                    </div>
                    <p className="leading-relaxed">{n.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* right — actions */}
        <div className="space-y-4">
          {/* assign — secretariat/admin only */}
          {['Secretariat', 'Admin'].includes(user?.role) && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Assign Case Manager</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Select value={selectedManager} onValueChange={setSelectedManager}>
                  <SelectTrigger><SelectValue placeholder="Select a manager..." /></SelectTrigger>
                  <SelectContent>
                    {managers.map(m => (
                      <SelectItem key={m._id} value={m._id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button className="w-full" onClick={handleAssign} disabled={assigning}>
                  {assigning ? 'Assigning...' : 'Assign'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* status update */}
          {canManage && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Update Status</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['New', 'Assigned', 'In Progress', 'Pending', 'Resolved', 'Escalated'].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Add a Note</Label>
                  <Textarea rows={3} placeholder="Add a response or note..." value={note} onChange={e => setNote(e.target.value)} />
                </div>

                {newStatus === 'Resolved' && (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Action Taken</Label>
                      <Textarea rows={2} placeholder="What action was taken?" value={actionTaken} onChange={e => setActionTaken(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">What Changed</Label>
                      <Textarea rows={2} placeholder="What changed as a result?" value={whatChanged} onChange={e => setWhatChanged(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={makePublic} onCheckedChange={setMakePublic} />
                      <Label className="text-xs">Show in Public Hub</Label>
                    </div>
                  </>
                )}

                <Button className="w-full" onClick={handleUpdate} disabled={updating}>
                  {updating ? 'Saving...' : 'Save Update'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* resolution summary */}
          {caseData.status === 'Resolved' && caseData.actionTaken && (
            <Card className="border-emerald-200 bg-emerald-50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-bold text-emerald-700">Resolution Summary</span>
                </div>
                <p className="text-sm mb-2"><strong>Action taken:</strong> {caseData.actionTaken}</p>
                {caseData.whatChanged && <p className="text-sm"><strong>What changed:</strong> {caseData.whatChanged}</p>}
                {caseData.resolvedAt && <p className="text-xs text-muted-foreground mt-2">Resolved {new Date(caseData.resolvedAt).toLocaleDateString()}</p>}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CaseDetailPage() {
  return <ProtectedLayout><CaseDetailContent /></ProtectedLayout>;
}