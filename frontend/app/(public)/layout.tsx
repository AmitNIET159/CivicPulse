/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, FileText, PlusCircle, LogIn, LayoutDashboard, LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const navLinks = [
  { href: '/', label: 'Home', icon: FileText },
  { href: '/map', label: 'Map', icon: Map },
  { href: '/issues', label: 'Issues', icon: FileText },
  { href: '/report', label: 'Report', icon: PlusCircle },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const { prefersReducedMotion } = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Desktop Navigation */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-white/[0.06] backdrop-blur-xl bg-background/70',
          scrolled ? 'shadow-[0_4px_30px_rgba(0,0,0,0.1)]' : ''
        )}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[linear-gradient(135deg,#2A2A2A,#1A1A1A,#2A2A2A)] border border-white/[0.1] flex items-center justify-center overflow-hidden relative shadow-lg">
              <img src="/logo.jpeg" alt="CivicPulse Logo" className="w-full h-full object-cover opacity-80 mix-blend-screen" />
              <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
            </div>
            <span className="font-display font-extrabold tracking-tight text-xl text-text-primary">
              CivicPulse<span className="text-primary">.</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm font-medium transition-colors relative py-2',
                    isActive ? 'text-primary' : 'text-text-muted hover:text-text-primary'
                  )}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full shadow-[0_0_8px_rgba(232,148,58,0.5)]"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                {user?.role === 'official' && (
                  <Link href="/dashboard" className="text-sm font-medium text-text-muted hover:text-text-primary flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-2 border border-white/[0.06]">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-text-primary">{user?.name}</span>
                </div>
                <button onClick={logout} className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-2 rounded-lg transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all duration-300 ease-out hover:-translate-y-0.5"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content with Depth Transition */}
      <main className="flex-grow pt-16 pb-20 md:pb-0 relative perspective-[1200px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, filter: 'blur(10px)', z: -100 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, filter: 'blur(0px)', z: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.05, filter: 'blur(10px)', z: 100 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="h-full transform-style-3d"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-white/[0.06] pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex flex-col items-center justify-center w-full h-full space-y-1 relative',
                  isActive ? 'text-primary' : 'text-text-muted hover:text-text-primary'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute top-0 w-8 h-0.5 bg-primary rounded-full shadow-[0_0_8px_rgba(232,148,58,0.5)]"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={cn('w-5 h-5', isActive && 'animate-pulse')} />
                <span className="text-[10px] font-medium">{link.label}</span>
              </Link>
            );
          })}
          {isAuthenticated ? (
             <Link
                href="/dashboard"
                className={cn(
                  'flex flex-col items-center justify-center w-full h-full space-y-1 relative text-text-muted hover:text-text-primary'
                )}
             >
                <LayoutDashboard className="w-5 h-5" />
                <span className="text-[10px] font-medium">Dashboard</span>
             </Link>
          ) : (
            <Link
                href="/login"
                className={cn(
                  'flex flex-col items-center justify-center w-full h-full space-y-1 relative text-text-muted hover:text-text-primary'
                )}
            >
                <LogIn className="w-5 h-5" />
                <span className="text-[10px] font-medium">Login</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Minimal Footer */}
      <footer className="hidden md:block py-6 border-t border-white/[0.06] bg-background">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} CivicPulse. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-text-muted">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

