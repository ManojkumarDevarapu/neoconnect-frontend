'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, AuthProvider } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';

function LayoutInner({ children, requiredRoles }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace('/login');
      else if (requiredRoles && !requiredRoles.includes(user.role)) router.replace('/dashboard');
    }
  }, [user, loading]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-7 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

export default function ProtectedLayout({ children, requiredRoles }) {
  return (
    <AuthProvider>
      <LayoutInner requiredRoles={requiredRoles}>
        {children}
      </LayoutInner>
    </AuthProvider>
  );
}