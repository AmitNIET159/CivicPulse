'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'depth';
  delay?: number;
}

const directionConfig = {
  up: { y: 40, x: 0, rotateX: 0, z: 0 },
  down: { y: -40, x: 0, rotateX: 0, z: 0 },
  left: { y: 0, x: -40, rotateX: 0, z: 0 },
  right: { y: 0, x: 40, rotateX: 0, z: 0 },
  depth: { y: 20, x: 0, rotateX: 5, z: -50 },
};

export default function ScrollReveal({ children, className, direction = 'up', delay = 0 }: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const { prefersReducedMotion } = useReducedMotion();
  const d = directionConfig[direction];

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: d.y, x: d.x, rotateX: d.rotateX }}
      animate={isInView ? { opacity: 1, y: 0, x: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      style={{ perspective: direction === 'depth' ? 800 : undefined }}
    >
      {children}
    </motion.div>
  );
}
