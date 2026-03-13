'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/utils/api';

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  // forgot password state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [step, setStep] = useState(1); // 1 = enter email, 2 = enter new password, 3 = success
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotOpen = () => {
    setStep(1);
    setResetEmail('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotOpen(true);
  };

  const handleEmailCheck = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) { toast.error('Enter your email address'); return; }
    setResetting(true);
    try {
      // verify email exists by attempting a dry check
      await api.post('/auth/reset-password', { email: resetEmail, newPassword: 'checkonly__' });
      // won't reach here normally — we move to step 2 regardless if email found
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (msg === 'No account found with that email address') {
        toast.error('No account found with that email');
        setResetting(false);
        return;
      }
      // any other error means email exists, proceed
    }
    setStep(2);
    setResetting(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setResetting(true);
    try {
      await api.post('/auth/reset-password', { email: resetEmail, newPassword });
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-violet-700 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">◈</div>
          <h1 className="text-3xl font-extrabold text-white">NeoConnect</h1>
          <p className="text-blue-100 mt-1 text-sm">Staff Feedback & Case Management</p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader>
            <CardTitle className="text-xl">Sign in to your account</CardTitle>
            <CardDescription>Enter your work email and password below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" placeholder="you@company.com"
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={handleForgotOpen}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input id="password" type="password" placeholder="••••••••"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-5">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-blue-600 font-medium hover:underline">Register here</Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-blue-200 mt-6">NeoStats © 2026 — All Rights Reserved</p>
      </div>

      {/* Forgot Password Modal */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {step === 1 && 'Forgot Password'}
              {step === 2 && 'Set New Password'}
              {step === 3 && 'Password Reset'}
            </DialogTitle>
          </DialogHeader>

          {/* Step 1 — enter email */}
          {step === 1 && (
            <form onSubmit={handleEmailCheck} className="space-y-4 mt-1">
              <p className="text-sm text-muted-foreground">
                Enter your work email address and we&apos;ll let you set a new password.
              </p>
              <div className="space-y-1.5">
                <Label>Email address</Label>
                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={resetting}>
                  {resetting ? 'Checking...' : 'Continue'}
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => setForgotOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Step 2 — set new password */}
          {step === 2 && (
            <form onSubmit={handleReset} className="space-y-4 mt-1">
              <p className="text-sm text-muted-foreground">
                Account found for <strong>{resetEmail}</strong>. Enter your new password below.
              </p>
              <div className="space-y-1.5">
                <Label>New Password</Label>
                <Input
                  type="password"
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={resetting}>
                  {resetting ? 'Resetting...' : 'Reset Password'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
              </div>
            </form>
          )}

          {/* Step 3 — success */}
          {step === 3 && (
            <div className="text-center py-4 space-y-4">
              <CheckCircle className="h-14 w-14 text-emerald-500 mx-auto" />
              <div>
                <p className="font-semibold text-gray-800">Password reset successfully!</p>
                <p className="text-sm text-muted-foreground mt-1">You can now log in with your new password.</p>
              </div>
              <Button className="w-full" onClick={() => { setForgotOpen(false); setForm(p => ({ ...p, email: resetEmail, password: '' })); }}>
                Back to Login
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function LoginPage() {
  return <AuthProvider><LoginForm /></AuthProvider>;
}