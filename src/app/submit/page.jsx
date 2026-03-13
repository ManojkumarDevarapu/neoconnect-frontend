'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedLayout from '@/components/ProtectedLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/utils/api';

const CATEGORIES = ['Safety', 'Policy', 'Facilities', 'HR', 'Other'];
const DEPARTMENTS = ['Engineering', 'HR', 'Finance', 'Operations', 'IT', 'Legal', 'Marketing', 'Other'];
const SEVERITIES = ['Low', 'Medium', 'High'];
const LOCATIONS = ['Head Office', 'Branch A', 'Branch B', 'Remote', 'Other'];

function SubmitContent() {
  const router = useRouter();
  const [form, setForm] = useState({ category: '', department: '', location: '', severity: 'Low', description: '', isAnonymous: false });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.department || !form.location || !form.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('attachment', file);

      const res = await api.post('/cases', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSubmitted(res.data);
      toast.success('Case submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto">
        <Card className="text-center shadow-lg border-0">
          <CardContent className="pt-10 pb-10">
            <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Case Submitted!</h2>
            <p className="text-muted-foreground mb-6">Your case has been received and will be reviewed shortly.</p>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">Your Tracking ID</p>
              <p className="text-3xl font-black text-blue-700 font-mono">{submitted.trackingId}</p>
              <p className="text-xs text-muted-foreground mt-2">Save this ID to track your case</p>
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.push('/my-cases')}>View My Cases</Button>
              <Button variant="outline" onClick={() => { setSubmitted(null); setForm({ category: '', department: '', location: '', severity: 'Low', description: '', isAnonymous: false }); setFile(null); }}>
                Submit Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Submit a Case</h1>
        <p className="text-muted-foreground mt-1">All submissions are confidential and get a unique tracking ID.</p>
      </div>

      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* anonymous toggle */}
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4">
              <div>
                <p className="font-semibold text-sm">Submit Anonymously</p>
                <p className="text-xs text-muted-foreground mt-0.5">Your name will not be shown to anyone</p>
              </div>
              <Switch checked={form.isAnonymous} onCheckedChange={v => setForm(p => ({ ...p, isAnonymous: v }))} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Severity *</Label>
                <Select value={form.severity} onValueChange={v => setForm(p => ({ ...p, severity: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SEVERITIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Department *</Label>
                <Select value={form.department} onValueChange={v => setForm(p => ({ ...p, department: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Location *</Label>
                <Select value={form.location} onValueChange={v => setForm(p => ({ ...p, location: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                  <SelectContent>{LOCATIONS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Description *</Label>
              <Textarea
                placeholder="Describe the issue in detail. Include when it happened, who was involved, and any other relevant context..."
                rows={5}
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Attach File (optional)</Label>
              <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Upload className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setFile(e.target.files[0])} className="text-sm" />
                {file && <p className="text-xs text-green-600 mt-1 font-medium">Selected: {file.name}</p>}
                <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG — max 10MB</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Case'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/dashboard')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SubmitPage() {
  return <ProtectedLayout><SubmitContent /></ProtectedLayout>;
}