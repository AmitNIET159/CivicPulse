'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface ParallaxSectionProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  direction?: 'up' | 'down';
  depth?: boolean;
}

export default function ParallaxSection({ children, className, speed = 0.3, direction = 'up', depth }: ParallaxSectionProps) {
  const ref = useRef(null);
  const { prefersReducedMotion } = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  const multiplier = direction === 'up' ? -1 : 1;
  const y = useTransform(scrollYProgress, [0, 1], [speed * 100 * multiplier, -speed * 100 * multiplier]);
  const z = useTransform(scrollYProgress, [0, 0.5, 1], [-20, 10, -20]);

  if (prefersReducedMotion) {
    return <div ref={ref} className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      style={{
        y,
        ...(depth ? { z, perspective: 800 } : {}),
      }}
      className={cn('will-change-transform', className)}
    >
      {children}
    </motion.div>
  );
}
