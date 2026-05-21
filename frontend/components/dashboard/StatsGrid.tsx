'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { TrendingUp, CheckCircle, AlertCircle, Users } from 'lucide-react';

interface Stat {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  suffix?: string;
}

interface StatsGridProps {
  stats: Stat[];
}

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass-card p-5 group hover:border-opacity-50 transition-all"
          style={{ borderColor: stat.color + '30' }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-1">
                {stat.label}
              </p>
              <p className="text-3xl font-bold" style={{ color: stat.color }}>
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: stat.color + '15' }}
            >
              <div style={{ color: stat.color }}>{stat.icon}</div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export { AnimatedCounter };
