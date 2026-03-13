'use client';
import { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/utils/api';

const ROLES = ['Staff', 'Secretariat', 'Case Manager', 'Admin'];
const DEPTS = ['Engineering', 'HR', 'Finance', 'Operations', 'IT', 'Legal', 'Marketing', 'Other'];

function UserManagementContent() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Staff', department: '', isActive: true });
  const [saving, setSaving] = useState(false);
  const [filterRole, setFilterRole] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = () => {
    api.get('/users').then(res => { setUsers(res.data); setLoading(false); }).catch(() => setLoading(false));
  };

  const openCreate = () => {
    setEditUser(null);
    setForm({ name: '', email: '', password: '', role: 'Staff', department: 'none', isActive: true });
    setOpen(true);
  };

  const openEdit = (u) => {
    setEditUser(u);
    setForm({ name: u.name, email: u.email, password: '', role: u.role, department: u.department || 'none', isActive: u.isActive });
    setOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, department: form.department === 'none' ? '' : form.department };
      if (editUser) {
        const res = await api.patch(`/users/${editUser._id}`, payload);
        setUsers(p => p.map(u => u._id === editUser._id ? res.data : u));
        toast.success('User updated');
      } else {
        const res = await api.post('/users', payload);
        setUsers(p => [res.data, ...p]);
        toast.success('User created');
      }
      setOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(p => p.filter(u => u._id !== id));
      toast.success('User deleted');
    } catch { toast.error('Delete failed'); }
  };

  const displayed = filterRole ? users.filter(u => u.role === filterRole) : users;

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">{users.length} total users in the system</p>
        </div>
        <Button onClick={openCreate}><PlusCircle className="h-4 w-4 mr-1" /> Add User</Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        <Button size="sm" variant={filterRole === '' ? 'default' : 'outline'} onClick={() => setFilterRole('')}>All Roles</Button>
        {ROLES.map(r => (
          <Button key={r} size="sm" variant={filterRole === r ? 'default' : 'outline'} onClick={() => setFilterRole(r)}>{r}</Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {displayed.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Name</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase">Email</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase">Role</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase">Department</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase">Joined</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map(u => (
                    <tr key={u._id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium">{u.name}</td>
                      <td className="px-3 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-3 py-3">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{u.role}</span>
                      </td>
                      <td className="px-3 py-3">{u.department || '—'}</td>
                      <td className="px-3 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {u.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEdit(u)}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(u._id)}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editUser ? 'Edit User' : 'Add New User'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Full Name *</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required disabled={!!editUser} />
            </div>
            {!editUser && (
              <div className="space-y-1.5">
                <Label>Password *</Label>
                <Input type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={v => setForm(p => ({ ...p, role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Select value={form.department} onValueChange={v => setForm(p => ({ ...p, department: v }))}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {DEPTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {editUser && (
              <div className="flex items-center gap-2">
                <Switch checked={form.isActive} onCheckedChange={v => setForm(p => ({ ...p, isActive: v }))} />
                <Label>Account Active</Label>
              </div>
            )}
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function UsersPage() {
  return (
    <ProtectedLayout requiredRoles={['Admin']}>
      <UserManagementContent />
    </ProtectedLayout>
  );
}