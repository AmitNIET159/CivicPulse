/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, FileText, BarChart3, Map, Users, ArrowLeft, Shield, LogOut } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';

import NotificationBell from '@/components/dashboard/NotificationBell';
import NotificationPoller from '@/components/dashboard/NotificationPoller';

export default function OfficialLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user || (user.role !== 'official' && user.role !== 'admin')) {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user || (user.role !== 'official' && user.role !== 'admin')) {
    return null;
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: '/dashboard/issues', label: 'Issues', icon: <FileText className="w-4 h-4" /> },
    { href: '/dashboard/analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { href: '/dashboard/heatmap', label: 'Heatmap', icon: <Map className="w-4 h-4" /> },
    ...(user.role === 'admin'
      ? [{ href: '/dashboard/officials', label: 'Officials', icon: <Users className="w-4 h-4" /> },
        { href: '/dashboard/admin', label: 'Admin Panel', icon: <Shield className="w-4 h-4" /> }
      ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/[0.06] bg-[#0A0A0A] flex-shrink-0 sticky top-0 h-screen overflow-y-auto hidden lg:flex flex-col relative before:absolute before:inset-0 before:bg-[linear-gradient(135deg,#2A2A2A,#1A1A1A,#2A2A2A)] before:opacity-10 before:pointer-events-none">
        <div className="p-5 relative z-10">
          <Link href="/" className="flex items-center gap-2 mb-8 group">
            <img src="/logo.jpeg" alt="CivicPulse Logo" className="w-8 h-8 rounded-lg object-cover" />
            <div>
              <span className="text-sm font-bold text-text-primary block">CivicPulse<span className="text-primary">.</span></span>
              <span className="text-xs text-primary font-medium flex items-center gap-1">
                <Shield className="w-3 h-3 text-primary" />
                {user.role === 'admin' ? 'Admin' : 'Official'}
              </span>
            </div>
          </Link>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-all border-l-2",
                    isActive
                      ? "text-primary border-primary bg-surface-2/20"
                      : "text-text-muted border-transparent hover:text-text-primary hover:bg-surface-2/10"
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-5 mt-auto border-t border-white/[0.06] relative z-10">
          <div className="mb-3 p-3 rounded-lg border border-white/[0.06] bg-[linear-gradient(135deg,#2A2A2A,#1A1A1A,#2A2A2A)] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
              {user.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-text-primary">{user.name}</p>
              <p className="text-xs text-text-muted truncate">{user.ward || user.department}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-text-muted hover:text-text-primary border border-white/[0.06] rounded-lg hover:bg-surface-2/50 transition-colors">
              <ArrowLeft className="w-3 h-3" /> Public
            </Link>
            <button
              onClick={logout}
              className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-danger border border-danger/30 rounded-lg hover:bg-danger/10 transition-colors"
            >
              <LogOut className="w-3 h-3" />
            </button>
          </div>
        </div>
      </aside>

      <NotificationPoller />

      {/* Main */}
      <main className="flex-1 overflow-x-hidden flex flex-col">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-end p-4 border-b border-white/[0.06] sticky top-0 z-40 bg-background/80 backdrop-blur-md">
          <NotificationBell />
        </div>

        {/* Mobile top bar */}
        <div className="lg:hidden glass-card rounded-none border-l-0 border-r-0 border-t-0 p-3 flex items-center justify-between sticky top-0 z-40 bg-background/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <img src="/logo.jpeg" alt="CivicPulse Logo" className="w-7 h-7 rounded object-cover" />
            <span className="text-sm font-bold text-text-primary">Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
          </div>
        </div>
        
        {/* Mobile Nav */}
        <div className="lg:hidden glass-card rounded-none border-0 p-2 flex gap-1 overflow-x-auto sticky top-[53px] z-30 bg-background/95">
          {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "p-2 rounded-lg transition-colors border-b-2",
                    isActive ? "text-primary border-primary bg-primary/10" : "text-text-muted border-transparent"
                  )}
                >
                  {item.icon}
                </Link>
              );
            })}
          </div>

        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="p-6"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}


