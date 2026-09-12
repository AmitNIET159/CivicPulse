'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import DepthCard from '@/components/ui/DepthCard';
import MagneticButton from '@/components/ui/MagneticButton';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.post('/api/auth/login', { email, password });
        login(res.data.user, res.data.accessToken, res.data.refreshToken);
        toast.success(`Welcome back, ${res.data.user.name}!`);
        if (res.data.user.role === 'official' || res.data.user.role === 'admin') {
          router.push('/dashboard');
        } else {
          router.push('/');
        }
      } else {
        const res = await api.post('/api/auth/register', { name, email, password });
        login(res.data.user, res.data.accessToken, res.data.refreshToken);
        toast.success('Account created! Welcome to CivicPulse.');
        router.push('/');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Subtle ambient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5 pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-[linear-gradient(135deg,#2A2A2A,#1A1A1A,#2A2A2A)] border border-white/[0.06] shadow-xl">
            <span className="text-primary text-xl font-bold tracking-tighter">CP</span>
          </div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight">
            {isLogin ? 'Welcome Back' : 'Join CivicPulse'}
          </h1>
          <p className="text-text-muted text-sm">
            {isLogin ? 'Login to report and vote on civic issues' : 'Create an account to start making a difference'}
          </p>
        </div>

        <DepthCard depth="medium" className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-sm text-text-muted mb-1 block font-medium">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required={!isLogin}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0A0A0A] border border-white/[0.06] rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm text-text-muted mb-1 block font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0A0A0A] border border-white/[0.06] rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-text-muted mb-1 block font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0A0A0A] border border-white/[0.06] rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-background rounded-lg font-semibold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isLogin ? (
                <LogIn className="w-4 h-4" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {isLogin ? 'Login' : 'Create Account'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-text-muted hover:text-primary transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
            </button>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 pt-4 border-t border-white/[0.06]">
            <p className="text-xs text-text-muted text-center mb-3 uppercase tracking-wider">Demo Credentials</p>
            <div className="grid grid-cols-1 gap-2 text-xs">
              {[
                { label: 'Admin', email: 'admin@civicpulse.in', pass: 'admin123' },
                { label: 'Official', email: 'amit.official@civicpulse.in', pass: 'official123' },
                { label: 'Citizen', email: 'citizen1@example.com', pass: 'citizen123' },
              ].map((cred) => (
                <button
                  key={cred.label}
                  type="button"
                  onClick={() => { setEmail(cred.email); setPassword(cred.pass); setIsLogin(true); }}
                  className="flex items-center justify-between px-3 py-2.5 bg-[#1A1A1A] rounded-lg border border-white/[0.06] hover:border-primary/30 hover:bg-surface transition-colors text-left"
                >
                  <span className="text-text-muted font-medium">{cred.label}</span>
                  <span className="font-mono text-text-primary opacity-80">{cred.email}</span>
                </button>
              ))}
            </div>
          </div>
        </DepthCard>
      </motion.div>
    </div>
  );
}
