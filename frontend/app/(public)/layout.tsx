'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, FileText, PlusCircle, LogIn, LayoutDashboard, LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuthStore();

  const navLinks = [
    { href: '/', label: 'Home', icon: <FileText className="w-4 h-4" /> },
    { href: '/map', label: 'Map', icon: <Map className="w-4 h-4" /> },
    { href: '/issues', label: 'Issues', icon: <FileText className="w-4 h-4" /> },
    { href: '/report', label: 'Report', icon: <PlusCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-t-0 rounded-none border-l-0 border-r-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <img src="/logo.jpeg" alt="CivicPulse Logo" className="w-8 h-8 rounded-lg object-cover" />
              <span className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors">
                CivicPulse
              </span>
            </Link>

            {/* Nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-text-muted hover:text-text-primary hover:bg-surface'
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Auth section */}
            <div className="flex items-center gap-3">
              {isAuthenticated && user ? (
                <>
                  {(user.role === 'official' || user.role === 'admin') && (
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-warning hover:bg-warning/10 rounded-lg transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span className="hidden sm:inline">Dashboard</span>
                    </Link>
                  )}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-surface rounded-lg border border-border">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm text-text-primary hidden sm:inline">{user.name}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 text-text-muted hover:text-danger transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden border-t border-border">
          <div className="flex justify-around py-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1 text-xs ${
                    isActive ? 'text-primary' : 'text-text-muted'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="pt-16 md:pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo.jpeg" alt="CivicPulse Logo" className="w-6 h-6 rounded object-cover" />
              <span className="text-sm text-text-muted">CivicPulse © 2026. Making cities better, together.</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-text-muted">
              <Link href="/issues" className="hover:text-text-primary transition-colors">Issues</Link>
              <Link href="/map" className="hover:text-text-primary transition-colors">Map</Link>
              <Link href="/report" className="hover:text-text-primary transition-colors">Report</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
