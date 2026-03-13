'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, PlusCircle, FileText, FolderOpen,
  BarChart3, Globe, Users, Vote, LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

const allLinks = [
  { href: '/dashboard',  label: 'Dashboard',       icon: LayoutDashboard, roles: ['Staff', 'Secretariat', 'Case Manager', 'Admin'] },
  { href: '/submit',     label: 'Submit Case',      icon: PlusCircle,      roles: ['Staff', 'Secretariat', 'Case Manager', 'Admin'] },
  { href: '/my-cases',   label: 'My Submissions',   icon: FileText,        roles: ['Staff'] },
  { href: '/all-cases',  label: 'All Cases',        icon: FolderOpen,      roles: ['Secretariat', 'Case Manager', 'Admin'] },
  { href: '/polls',      label: 'Polls',            icon: Vote,            roles: ['Staff', 'Secretariat', 'Case Manager', 'Admin'] },
  { href: '/hub',        label: 'Public Hub',       icon: Globe,           roles: ['Staff', 'Secretariat', 'Case Manager', 'Admin'] },
  { href: '/analytics',  label: 'Analytics',        icon: BarChart3,       roles: ['Secretariat', 'Admin'] },
  { href: '/users',      label: 'User Management',  icon: Users,           roles: ['Admin'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const links = allLinks.filter(l => l.roles.includes(user?.role));

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-100 flex flex-col py-4 px-3 shrink-0">
      {/* brand */}
      <div className="flex items-center gap-2 px-3 mb-6">
        <span className="text-blue-600 text-2xl font-black">◈</span>
        <span className="text-lg font-bold text-gray-900">NeoConnect</span>
      </div>

      {/* nav links */}
      <nav className="flex flex-col gap-1 flex-1">
        {links.map(link => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left',
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className={cn('h-4 w-4', active ? 'text-blue-600' : 'text-gray-400')} />
              {link.label}
            </button>
          );
        })}
      </nav>

      {/* user info + logout */}
      <div className="mt-auto pt-4 border-t border-gray-100">
        <div className="px-3 mb-3">
          <div className="text-sm font-semibold text-gray-900 truncate">{user?.name}</div>
          <div className="text-xs text-gray-400 truncate">{user?.email}</div>
          <span className="mt-1.5 inline-block text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
            {user?.role}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 w-full transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}