'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowRight, MapPin, Vote, CheckCircle, TrendingUp, AlertCircle, Users, Zap } from 'lucide-react';

import { Issue, CATEGORY_CONFIG, IssueCategory, StatsOverview } from '@/types';
import api from '@/lib/api';
import IssueCard from '@/components/issues/IssueCard';
import StatsGrid from '@/components/dashboard/StatsGrid';

import AmbientGrid from '@/components/ui/AmbientGrid';
import DepthCard from '@/components/ui/DepthCard';
import ScrollReveal from '@/components/ui/ScrollReveal';
import ParallaxSection from '@/components/ui/ParallaxSection';
import CounterAnimation from '@/components/ui/CounterAnimation';
import MagneticButton from '@/components/ui/MagneticButton';

// Dynamic import for Map to avoid SSR issues
const IssueMap = dynamic(() => import('@/components/map/IssueMap'), { ssr: false });

export default function HomePage() {
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [topIssues, setTopIssues] = useState<Issue[]>([]);
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [statsData, topData, recentData] = await Promise.all([
          api.get('/api/stats/overview'),
          api.get('/api/issues/priority?limit=5'),
          api.get('/api/issues?limit=10&sort=newest')
        ]);
        
        setStats(statsData.data);
        setTopIssues(topData.data);
        setRecentIssues(recentData.data.issues || []);
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <AmbientGrid />
        
        {/* Cinematic Isometric Wireframe / Data Ring */}
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-40 pointer-events-none perspective-[1000px]">
          <motion.div 
            animate={{ rotateZ: 360, rotateX: [60, 65, 60], rotateY: [0, 5, 0] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="w-[800px] h-[800px] border-[1px] border-primary/20 rounded-full flex items-center justify-center"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="w-[600px] h-[600px] border-[1px] border-primary/40 rounded-full border-dashed" />
            <div className="absolute w-[400px] h-[400px] border-[2px] border-primary/10 rounded-full" />
            <div className="absolute w-[900px] h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="absolute h-[900px] w-[1px] bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
          </motion.div>
        </div>

        {/* Ambient Fog Overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 z-10 text-center flex flex-col items-center mt-12">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141414]/80 border border-primary/30 backdrop-blur-md mb-8 shadow-[0_0_30px_rgba(232,148,58,0.15)]"
            style={{ transform: "perspective(800px) rotateX(5deg)" }}
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(232,148,58,0.8)]" />
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">System Online // Grid Active</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-6xl md:text-8xl font-display font-extrabold tracking-tighter mb-6 relative"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-[#F5F0EB] to-[#8A8580] drop-shadow-lg">
              Report. 
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#F0A850] to-primary drop-shadow-[0_0_30px_rgba(232,148,58,0.4)] mx-4 relative">
              Vote.
              {/* Glowing underscore */}
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent blur-[2px]" />
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#8A8580] via-[#5C5855] to-[#222222]">
              Resolve.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto mb-12 leading-relaxed font-light backdrop-blur-sm"
          >
            Join the decentralized network for civic improvement. Pinpoint anomalies, gather community consensus, and track real-time resolution protocols.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto"
          >
            <MagneticButton href="/report" variant="primary" className="w-full sm:w-auto text-base px-10 py-5 rounded-xl shadow-[0_0_40px_rgba(232,148,58,0.25)] border border-primary/50 relative overflow-hidden group">
              <span className="relative z-10 flex items-center">
                Initialize Report
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            </MagneticButton>
            
            <MagneticButton href="/map" variant="secondary" className="w-full sm:w-auto text-base px-10 py-5 rounded-xl bg-surface-2/50 backdrop-blur-md">
              Access Grid Map
              <MapPin className="w-4 h-4 ml-2 text-primary" />
            </MagneticButton>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-muted"
        >
          <span className="text-xs uppercase tracking-widest font-mono">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-text-muted/50 to-transparent relative overflow-hidden">
            <motion.div
              animate={{ y: [0, 48] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent via-primary to-transparent"
            />
          </div>
        </motion.div>
      </section>

      {/* LIVE STATS SECTION */}
      <ParallaxSection speed={0.1} className="py-24 bg-surface-2/30 border-y border-white/[0.04]">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="up" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-4">Network Pulse</h2>
            <p className="text-text-muted">Real-time civic impact across the community</p>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ScrollReveal direction="depth" delay={0.1}>
              <DepthCard depth="medium" className="p-8 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 border border-primary/20 shadow-[0_0_15px_rgba(232,148,58,0.15)]">
                  <AlertCircle className="w-6 h-6 text-primary" />
                </div>
                <div className="text-4xl font-bold text-text-primary mb-2">
                  <CounterAnimation value={stats?.totalIssues || 0} />
                </div>
                <div className="text-sm text-text-muted font-medium">Total Reports</div>
              </DepthCard>
            </ScrollReveal>
            
            <ScrollReveal direction="depth" delay={0.2}>
              <DepthCard depth="medium" className="p-8 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#4ADE80]/10 flex items-center justify-center mb-4 border border-[#4ADE80]/20 shadow-[0_0_15px_rgba(74,222,128,0.15)]">
                  <CheckCircle className="w-6 h-6 text-[#4ADE80]" />
                </div>
                <div className="text-4xl font-bold text-text-primary mb-2">
                  <CounterAnimation value={stats?.resolved || 0} />
                </div>
                <div className="text-sm text-text-muted font-medium">Resolved</div>
              </DepthCard>
            </ScrollReveal>

            <ScrollReveal direction="depth" delay={0.3}>
              <DepthCard depth="medium" className="p-8 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#FBBF24]/10 flex items-center justify-center mb-4 border border-[#FBBF24]/20 shadow-[0_0_15px_rgba(251,191,36,0.15)]">
                  <Users className="w-6 h-6 text-[#FBBF24]" />
                </div>
                <div className="text-4xl font-bold text-text-primary mb-2">
                  <CounterAnimation value={(stats?.pending || 0) + (stats?.inProgress || 0)} />
                </div>
                <div className="text-sm text-text-muted font-medium">Active Issues</div>
              </DepthCard>
            </ScrollReveal>

            <ScrollReveal direction="depth" delay={0.4}>
              <DepthCard depth="medium" className="p-8 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#F0A850]/10 flex items-center justify-center mb-4 border border-[#F0A850]/20 shadow-[0_0_15px_rgba(240,168,80,0.15)]">
                  <Zap className="w-6 h-6 text-[#F0A850]" />
                </div>
                <div className="text-4xl font-bold text-text-primary mb-2">
                  <CounterAnimation value={stats?.avgResolutionTime || 0} suffix="d" />
                </div>
                <div className="text-sm text-text-muted font-medium">Avg Resolution</div>
              </DepthCard>
            </ScrollReveal>
          </div>
        </div>
      </ParallaxSection>

      {/* HOW IT WORKS */}
      <ParallaxSection speed={0.2} className="py-24 relative">
        <div className="container mx-auto px-4">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-4">The Civic Protocol</h2>
            <p className="text-text-muted max-w-2xl mx-auto">How our decentralized reporting mechanism drives real-world change.</p>
          </ScrollReveal>
          
          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {/* Connection Line (desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.1] to-transparent -z-10" />
            
            <ScrollReveal direction="up" delay={0.1}>
              <DepthCard depth="medium" className="p-8 relative h-full">
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-xl bg-surface border border-white/[0.1] flex items-center justify-center font-mono font-bold text-primary shadow-lg shadow-black">01</div>
                <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-white/[0.08] flex items-center justify-center mb-6 text-primary">
                  <MapPin className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3">Identify & Report</h3>
                <p className="text-text-muted leading-relaxed">Pinpoint civic issues on the interactive map. Snap a photo, add details, and submit to the network.</p>
              </DepthCard>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.2}>
              <DepthCard depth="medium" className="p-8 relative h-full">
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-xl bg-surface border border-white/[0.1] flex items-center justify-center font-mono font-bold text-primary shadow-lg shadow-black">02</div>
                <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-white/[0.08] flex items-center justify-center mb-6 text-primary">
                  <Vote className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3">Community Validation</h3>
                <p className="text-text-muted leading-relaxed">Citizens review and upvote issues. Higher consensus signals priority to local authorities.</p>
              </DepthCard>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.3}>
              <DepthCard depth="medium" className="p-8 relative h-full">
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-xl bg-surface border border-white/[0.1] flex items-center justify-center font-mono font-bold text-primary shadow-lg shadow-black">03</div>
                <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-white/[0.08] flex items-center justify-center mb-6 text-[#4ADE80]">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3">Track Resolution</h3>
                <p className="text-text-muted leading-relaxed">Officials update statuses in real-time. Get notified when your reported issues are successfully resolved.</p>
              </DepthCard>
            </ScrollReveal>
          </div>
        </div>
      </ParallaxSection>

      {/* MINI MAP SECTION */}
      <section className="py-24 bg-[#111] relative overflow-hidden">
        {/* Glow behind map */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(232,148,58,0.05)_0%,transparent_70%)]" />
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="w-full lg:w-1/3">
              <ScrollReveal direction="left">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-6">Interactive Cartography</h2>
                <p className="text-text-muted mb-8 leading-relaxed">
                  Explore reports across your city through our spatial interface. Filter by category, status, or popularity to understand civic dynamics.
                </p>
                <MagneticButton href="/map" variant="secondary">
                  Open Full Map <ArrowRight className="w-4 h-4 ml-2" />
                </MagneticButton>
              </ScrollReveal>
            </div>
            <div className="w-full lg:w-2/3 h-[500px]">
              <ScrollReveal direction="depth" delay={0.2} className="h-full">
                <DepthCard depth="deep" className="w-full h-full p-2 bg-surface border-white/[0.1] shadow-2xl overflow-hidden rounded-3xl" noPerspective={true}>
                  {/* Keep functional map standard and flat */}
                  <div className="w-full h-full rounded-2xl overflow-hidden relative z-10 bg-background/50 backdrop-blur-sm">
                    {!isLoading ? (
                      <IssueMap issues={recentIssues} />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                </DepthCard>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY GRID */}
      <ParallaxSection className="py-24 relative">
        <div className="container mx-auto px-4">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-4">Issue Taxonomy</h2>
            <p className="text-text-muted">Structured categories for efficient routing and resolution.</p>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(CATEGORY_CONFIG).map(([key, config], idx) => {
              const iconEmoji = config.icon;
              // Map old colors to new palette for categories
              let accentColor = '#E8943A'; // amber default
              if(config.color === '#10B981') accentColor = '#4ADE80';
              if(config.color === '#F59E0B') accentColor = '#FBBF24';
              if(config.color === '#8B5CF6') accentColor = '#F0A850';
              if(config.color === '#EF4444') accentColor = '#F87171';

              return (
                <ScrollReveal key={key} direction="up" delay={idx * 0.1}>
                  <Link href={`/issues?category=${key}`}>
                    <DepthCard depth="shallow" className="p-6 h-full flex flex-col items-center justify-center text-center gap-4 hover:border-primary/50 group cursor-pointer transition-colors">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 text-2xl"
                        style={{ backgroundColor: `${accentColor}15`, border: `1px solid ${accentColor}30` }}
                      >
                        {iconEmoji}
                      </div>
                      <span className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">
                        {config.label}
                      </span>
                    </DepthCard>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </ParallaxSection>

      {/* PRIORITY ISSUES */}
      <section className="py-24 bg-surface-2/20 border-t border-white/[0.04]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <ScrollReveal direction="left">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-2 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-primary" />
                High Priority
              </h2>
              <p className="text-text-muted">Top issues demanding immediate attention</p>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2}>
              <MagneticButton href="/issues" variant="secondary">
                View All Issues
              </MagneticButton>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-80 rounded-2xl bg-surface border border-white/[0.05] animate-pulse" />
              ))
            ) : topIssues.length > 0 ? (
              topIssues.slice(0, 3).map((issue, idx) => (
                <ScrollReveal key={issue._id} direction="up" delay={idx * 0.1}>
                  <IssueCard issue={issue} />
                </ScrollReveal>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-text-muted border border-white/[0.05] rounded-2xl bg-surface/30">
                No high priority issues found.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
