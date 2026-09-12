'use client';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface CounterAnimationProps {
  value: number;
  suffix?: string;
  className?: string;
  duration?: number;
}

export default function CounterAnimation({ value, suffix = '', className, duration = 1500 }: CounterAnimationProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [hasTriggered, setHasTriggered] = useState(false);
  const { prefersReducedMotion } = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) { setCount(value); return; }
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasTriggered) {
        setHasTriggered(true);
        const startTime = performance.now();
        const animate = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(value * eased));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.3 });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration, hasTriggered, prefersReducedMotion]);

  return (
    <span ref={ref} className={cn('font-mono tabular-nums', className)}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}
