'use client';
import { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Vote, PlusCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/utils/api';

function PollCard({ poll, userId, canManage, onVote, onClose }) {
  const total = poll.options.reduce((s, o) => s + o.votes.length, 0);
  const voted = poll.options.some(o => o.votes.includes(userId));

  return (
    <Card className={poll.status === 'Escalated' ? 'border-red-200' : ''}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <CardTitle className="text-base font-semibold leading-snug">{poll.question}</CardTitle>
          {canManage && poll.isActive && (
            <Button size="sm" variant="outline" onClick={() => onClose(poll._id)} className="shrink-0">Close</Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {total} vote{total !== 1 ? 's' : ''} · {poll.isActive ? '🟢 Active' : '🔴 Closed'}
          {poll.createdBy?.name && ` · by ${poll.createdBy.name}`}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {poll.options.map((opt, i) => {
          const pct = total > 0 ? Math.round((opt.votes.length / total) * 100) : 0;
          const showResults = voted || !poll.isActive;

          return (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span>{opt.text}</span>
                {showResults && <span className="font-semibold text-blue-600">{pct}% ({opt.votes.length})</span>}
              </div>
              {showResults ? (
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              ) : (
                poll.isActive && (
                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => onVote(poll._id, i)}>
                    Vote for this
                  </Button>
                )
              )}
            </div>
          );
        })}
        {voted && <p className="text-xs text-emerald-600 font-semibold mt-2">✓ You have voted</p>}
      </CardContent>
    </Card>
  );
}

function PollsContent() {
  const { user } = useAuth();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [creating, setCreating] = useState(false);

  const canManage = ['Secretariat', 'Admin'].includes(user?.role);

  useEffect(() => {
    api.get('/polls').then(res => { setPolls(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleVote = async (pollId, optionIndex) => {
    try {
      const res = await api.post(`/polls/${pollId}/vote`, { optionIndex });
      setPolls(p => p.map(poll => poll._id === pollId ? res.data : poll));
      toast.success('Vote recorded!');
    } catch (err) { toast.error(err.response?.data?.message || 'Could not vote'); }
  };

  const handleClose = async (pollId) => {
    try {
      const res = await api.patch(`/polls/${pollId}/close`);
      setPolls(p => p.map(poll => poll._id === pollId ? res.data : poll));
      toast.success('Poll closed');
    } catch { toast.error('Failed to close poll'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const valid = options.filter(o => o.trim());
    if (!question.trim() || valid.length < 2) { toast.error('Need a question and at least 2 options'); return; }
    setCreating(true);
    try {
      const res = await api.post('/polls', { question, options: valid });
      setPolls(p => [res.data, ...p]);
      setQuestion('');
      setOptions(['', '']);
      setShowCreate(false);
      toast.success('Poll created!');
    } catch { toast.error('Failed to create poll'); }
    finally { setCreating(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold">Staff Polls</h1>
          <p className="text-muted-foreground mt-1">Vote on active polls and view past results.</p>
        </div>
        {canManage && (
          <Button onClick={() => setShowCreate(!showCreate)}>
            <PlusCircle className="h-4 w-4 mr-1" /> {showCreate ? 'Cancel' : 'New Poll'}
          </Button>
        )}
      </div>

      {/* create form */}
      {showCreate && canManage && (
        <Card className="mb-6 border-blue-200">
          <CardHeader><CardTitle className="text-base">Create New Poll</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Question *</Label>
                <Input placeholder="e.g. Should we introduce flexible Fridays?" value={question} onChange={e => setQuestion(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Options *</Label>
                {options.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <Input placeholder={`Option ${i + 1}`} value={opt} onChange={e => setOptions(p => { const n = [...p]; n[i] = e.target.value; return n; })} />
                    {options.length > 2 && (
                      <Button type="button" variant="outline" size="icon" onClick={() => setOptions(p => p.filter((_, idx) => idx !== i))}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setOptions(p => [...p, ''])}>+ Add Option</Button>
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={creating}>{creating ? 'Creating...' : 'Create Poll'}</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {polls.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Vote className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No polls yet</p>
          <p className="text-sm">Check back later for staff polls</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {polls.map(poll => (
            <PollCard key={poll._id} poll={poll} userId={user?._id} canManage={canManage} onVote={handleVote} onClose={handleClose} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PollsPage() {
  return <ProtectedLayout><PollsContent /></ProtectedLayout>;
}