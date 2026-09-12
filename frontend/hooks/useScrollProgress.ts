'use client';
import { useState, useEffect, useRef, RefObject } from 'react';
import { useReducedMotion } from './useReducedMotion';

export function useScrollProgress(): { progress: number; isInView: boolean; ref: RefObject<HTMLDivElement> } {
  const [progress, setProgress] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion } = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || !ref.current) return;
    const element = ref.current;
    let rafId: number;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(element);

    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const elementTop = rect.top;
        const elementHeight = rect.height;
        const p = Math.max(0, Math.min(1, (windowHeight - elementTop) / (windowHeight + elementHeight)));
        setProgress(p);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [prefersReducedMotion]);

  return { progress, isInView, ref };
}
