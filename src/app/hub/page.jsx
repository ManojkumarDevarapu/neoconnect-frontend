'use client';
import { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { StatusBadge, SeverityBadge } from '@/components/StatusBadge';
import { FileText, UploadCloud, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/utils/api';

function HubContent() {
  const { user } = useAuth();
  const canManage = ['Secretariat', 'Admin'].includes(user?.role);

  const [digest, setDigest] = useState([]);
  const [impact, setImpact] = useState([]);
  const [minutes, setMinutes] = useState([]);
  const [search, setSearch] = useState('');
  const [loadingTab, setLoadingTab] = useState('');

  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', description: '', tags: '' });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchDigest(); fetchImpact(); fetchMinutes(); }, []);

  const fetchDigest = () => {
    setLoadingTab('digest');
    api.get('/hub/digest').then(res => setDigest(res.data)).finally(() => setLoadingTab(''));
  };
  const fetchImpact = () => {
    api.get('/hub/impact').then(res => setImpact(res.data));
  };
  const fetchMinutes = (q = '') => {
    api.get(`/hub/minutes${q ? `?search=${q}` : ''}`).then(res => setMinutes(res.data));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) { toast.error('Select a file first'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('document', uploadFile);
      fd.append('title', uploadForm.title);
      fd.append('description', uploadForm.description);
      fd.append('tags', uploadForm.tags);
      const res = await api.post('/hub/minutes', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMinutes(p => [res.data, ...p]);
      setShowUpload(false);
      setUploadForm({ title: '', description: '', tags: '' });
      setUploadFile(null);
      toast.success('Minutes uploaded!');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">🌐 Public Hub</h1>
        <p className="text-muted-foreground mt-1">Transparency reports, impact tracking, and meeting archives for all staff.</p>
      </div>

      <Tabs defaultValue="digest">
        <TabsList className="mb-5">
          <TabsTrigger value="digest">Quarterly Digest</TabsTrigger>
          <TabsTrigger value="impact">Impact Tracking</TabsTrigger>
          <TabsTrigger value="minutes">Minutes Archive</TabsTrigger>
        </TabsList>

        {/* quarterly digest */}
        <TabsContent value="digest">
          {digest.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No public entries yet</p>
              <p className="text-sm">Resolved cases marked as public will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {digest.map(c => (
                <Card key={c._id} className="border-l-4 border-l-emerald-400">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-xs font-bold text-blue-600">{c.trackingId}</span>
                      <div className="flex gap-2">
                        <StatusBadge status="Resolved" />
                        <SeverityBadge severity={c.severity} />
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground mb-3">
                      <span>📂 {c.category}</span>
                      <span>🏢 {c.department}</span>
                      <span>📅 {new Date(c.resolvedAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3 leading-relaxed">{c.description}</p>
                    {c.actionTaken && (
                      <div className="bg-emerald-50 rounded-lg px-3 py-2 text-sm">
                        <strong>Action taken:</strong> {c.actionTaken}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* impact tracking */}
        <TabsContent value="impact">
          {impact.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No impact data yet</p>
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">ID</th>
                        <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase">What Was Raised</th>
                        <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase">Action Taken</th>
                        <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase">What Changed</th>
                        <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase">Dept</th>
                        <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase">Resolved</th>
                      </tr>
                    </thead>
                    <tbody>
                      {impact.map(c => (
                        <tr key={c._id} className="border-b last:border-0">
                          <td className="px-5 py-3 font-mono text-xs font-bold text-blue-600">{c.trackingId}</td>
                          <td className="px-3 py-3 max-w-[160px]"><p className="line-clamp-2 text-xs">{c.description}</p></td>
                          <td className="px-3 py-3 max-w-[160px]"><p className="line-clamp-2 text-xs">{c.actionTaken || '—'}</p></td>
                          <td className="px-3 py-3 max-w-[160px]"><p className="line-clamp-2 text-xs">{c.whatChanged || '—'}</p></td>
                          <td className="px-3 py-3 text-xs">{c.department}</td>
                          <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(c.resolvedAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* minutes archive */}
        <TabsContent value="minutes">
          <div className="flex gap-3 mb-4">
            <Input placeholder="Search by title or tags..." value={search} onChange={e => { setSearch(e.target.value); fetchMinutes(e.target.value); }} className="max-w-sm" />
            {canManage && (
              <Button onClick={() => setShowUpload(!showUpload)}>
                <UploadCloud className="h-4 w-4 mr-1" /> {showUpload ? 'Cancel' : 'Upload Minutes'}
              </Button>
            )}
          </div>

          {showUpload && canManage && (
            <Card className="mb-5 border-blue-200">
              <CardHeader><CardTitle className="text-base">Upload Meeting Minutes</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleUpload} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Title *</Label>
                    <Input value={uploadForm.title} onChange={e => setUploadForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. JCC Meeting — Q3 2024" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Description</Label>
                    <Input value={uploadForm.description} onChange={e => setUploadForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief summary" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tags (comma separated)</Label>
                    <Input value={uploadForm.tags} onChange={e => setUploadForm(p => ({ ...p, tags: e.target.value }))} placeholder="jcc, safety, hr" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>PDF File *</Label>
                    <input type="file" accept=".pdf" onChange={e => setUploadFile(e.target.files[0])} className="text-sm" />
                  </div>
                  <Button type="submit" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</Button>
                </form>
              </CardContent>
            </Card>
          )}

          {minutes.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No minutes uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {minutes.map(m => (
                <Card key={m._id}>
                  <CardContent className="pt-4 flex items-center gap-4">
                    <FileText className="h-8 w-8 text-red-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{m.title}</p>
                      {m.description && <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>}
                      <div className="flex flex-wrap gap-2 mt-2 items-center">
                        <span className="text-xs text-muted-foreground">Uploaded {new Date(m.createdAt).toLocaleDateString()} by {m.uploadedBy?.name}</span>
                        {m.tags?.map(t => (
                          <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{t}</span>
                        ))}
                      </div>
                    </div>
                    <a href={`http://localhost:5000${m.path}`} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> Download</Button>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function HubPage() {
  return <ProtectedLayout><HubContent /></ProtectedLayout>;
}