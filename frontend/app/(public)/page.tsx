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

const IssueMap = dynamic(() => import('@/components/map/IssueMap'), { ssr: false });

export default function HomePage() {
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [topIssues, setTopIssues] = useState<Issue[]>([]);
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);

  useEffect(() => {
    api.get('/api/stats/overview').then((r) => setStats(r.data)).catch(() => {});
    api.get('/api/issues/priority?limit=5').then((r) => setTopIssues(r.data.issues)).catch(() => {});
    api.get('/api/issues?limit=10&sort=newest').then((r) => setRecentIssues(r.data.issues)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-6 grid-pattern">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-background" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
            >
              <Zap className="w-4 h-4" />
              Hyperlocal Civic Issue Reporting
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              <span className="gradient-text">Report.</span>{' '}
              <span className="text-text-primary">Vote.</span>{' '}
              <span className="gradient-text">Resolve.</span>
            </h1>

            <p className="text-lg text-text-muted mb-8 max-w-xl mx-auto">
              Empower your community. Report civic issues like potholes, broken streetlights, and garbage.
              Vote to prioritize. Officials resolve.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/report"
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-all hover:scale-105 shadow-lg shadow-primary/25"
              >
                Report an Issue
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/map"
                className="flex items-center gap-2 px-6 py-3 border border-border text-text-primary rounded-xl font-semibold hover:bg-surface transition-all"
              >
                <MapPin className="w-4 h-4" />
                Explore Map
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Stats */}
      {stats && (
        <section className="py-8 px-6">
          <div className="max-w-7xl mx-auto">
            <StatsGrid
              stats={[
                { label: 'Total Issues Reported', value: stats.totalIssues, icon: <AlertCircle className="w-5 h-5" />, color: '#3B82F6' },
                { label: 'Resolved', value: stats.resolved, icon: <CheckCircle className="w-5 h-5" />, color: '#10B981' },
                { label: 'Active Issues', value: stats.pending + stats.inProgress, icon: <TrendingUp className="w-5 h-5" />, color: '#F59E0B' },
                { label: 'Avg Resolution', value: stats.avgResolutionTime, icon: <Users className="w-5 h-5" />, color: '#8B5CF6', suffix: ' days' },
              ]}
            />
          </div>
        </section>
      )}

      {/* Mini Map */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card overflow-hidden"
          >
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Recent Issues Near You</h2>
                <p className="text-sm text-text-muted mt-1">Latest reported issues in Delhi NCR</p>
              </div>
              <Link
                href="/map"
                className="flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                Full Map <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="h-[400px]">
              <IssueMap issues={recentIssues} interactive={true} height="400px" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <MapPin className="w-8 h-8" />, title: 'Report', desc: 'Pin the issue on the map, add a photo, and describe the problem in your area.' },
              { icon: <Vote className="w-8 h-8" />, title: 'Community Votes', desc: 'Citizens upvote issues they care about. Higher votes = higher priority for officials.' },
              { icon: <CheckCircle className="w-8 h-8" />, title: 'Officials Resolve', desc: 'Government officials pick up high-priority issues, assign teams, and resolve them.' },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="glass-card p-8 text-center group hover:border-primary/30 transition-all"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                  {step.icon}
                </div>
                <div className="w-8 h-8 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                  {i + 1}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-text-muted">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Report by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(CATEGORY_CONFIG).map(([key, config], i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
              >
                <Link
                  href={`/issues?category=${key}`}
                  className="glass-card glass-card-hover p-5 text-center group block"
                >
                  <span className="text-3xl block mb-2">{config.icon}</span>
                  <span className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">
                    {config.label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Priority Issues */}
      {topIssues.length > 0 && (
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold">Top Priority Issues</h2>
                <p className="text-sm text-text-muted mt-1">Most voted issues needing attention</p>
              </div>
              <Link
                href="/issues?sort=votes"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {topIssues.map((issue, i) => (
                <IssueCard key={issue._id} issue={issue} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
