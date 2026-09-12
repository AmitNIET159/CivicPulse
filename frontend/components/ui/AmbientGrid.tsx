'use client';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export default function AmbientGrid({ className }: { className?: string }) {
  const { prefersReducedMotion } = useReducedMotion();
  const [scrollY, setScrollY] = useState(0);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) return;
    
    let rafId: number;
    let startTime = performance.now();
    
    const tick = (now: number) => {
      setTime((now - startTime) / 1000);
      setScrollY(window.scrollY);
      rafId = requestAnimationFrame(tick);
    };
    
    rafId = requestAnimationFrame(tick);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [prefersReducedMotion]);

  return (
    <div
      className={cn('pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#050505]', className)}
      aria-hidden="true"
    >
      {/* Primary Grid Layer */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(232, 148, 58, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(232, 148, 58, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
          transform: `perspective(1000px) rotateX(65deg) translateY(${-100 + scrollY * 0.1 + (time * 10 % 100)}px) scale(3)`,
          transformOrigin: 'center top',
          opacity: 0.4,
        }}
      />
      
      {/* Secondary Fine Grid Layer (moves faster) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          transform: `perspective(1000px) rotateX(65deg) translateY(${-100 + scrollY * 0.15 + (time * 20 % 100)}px) scale(3)`,
          transformOrigin: 'center top',
          opacity: 0.5,
        }}
      />

      {/* Horizontal Scanning Line */}
      <div 
        className="absolute inset-x-0 h-[2px] bg-primary/40 shadow-[0_0_20px_rgba(232,148,58,0.8)] mix-blend-screen"
        style={{
          top: `${((time * 15) % 150) - 20}%`,
          opacity: 0.5 + Math.sin(time * 5) * 0.2,
        }}
      />

      {/* Vignette mask to fade edges into darkness */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0A0A0A_70%)]" />

      {/* Dynamic Glow Nodes */}
      <div 
        className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full blur-3xl mix-blend-screen" 
        style={{ 
          background: 'radial-gradient(circle, rgba(232,148,58,0.06), transparent 60%)',
          transform: `translate(${Math.sin(time * 0.5) * 20}px, ${Math.cos(time * 0.3) * 20}px)`
        }} 
      />
      <div 
        className="absolute top-2/3 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl mix-blend-screen" 
        style={{ 
          background: 'radial-gradient(circle, rgba(255,255,255,0.02), transparent 70%)',
          transform: `translate(${Math.cos(time * 0.4) * 30}px, ${Math.sin(time * 0.6) * 30}px)`
        }} 
      />
    </div>
  );
}
