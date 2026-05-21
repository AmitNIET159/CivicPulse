'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, FileText, BarChart3, Map, Users, ArrowLeft, Shield, LogOut } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

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
      ? [{ href: '/dashboard/officials', label: 'Officials', icon: <Users className="w-4 h-4" /> }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-surface/50 flex-shrink-0 sticky top-0 h-screen overflow-y-auto hidden lg:block">
        <div className="p-5">
          <Link href="/" className="flex items-center gap-2 mb-8 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">CP</span>
            </div>
            <div>
              <span className="text-sm font-bold text-text-primary block">CivicPulse</span>
              <span className="text-xs text-warning font-medium flex items-center gap-1">
                <Shield className="w-3 h-3" />
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
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-text-muted hover:text-text-primary hover:bg-background'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-5 mt-auto border-t border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
              {user.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-text-muted truncate">{user.ward || user.department}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-text-muted hover:text-text-primary border border-border rounded-lg hover:bg-background transition-colors">
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

      {/* Main */}
      <main className="flex-1 overflow-x-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden glass-card rounded-none border-l-0 border-r-0 border-t-0 p-3 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-xs">CP</span>
            </div>
            <span className="text-sm font-bold">Dashboard</span>
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`p-2 rounded-lg ${isActive ? 'bg-primary/10 text-primary' : 'text-text-muted'}`}
                >
                  {item.icon}
                </Link>
              );
            })}
          </div>
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
