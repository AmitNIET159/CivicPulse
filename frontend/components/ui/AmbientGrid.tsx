'use client';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export default function AmbientGrid({ className }: { className?: string }) {
  const { prefersReducedMotion } = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Refs for the animated layers to bypass React state updates
  const primaryGridRef = useRef<HTMLDivElement>(null);
  const secondaryGridRef = useRef<HTMLDivElement>(null);
  const scanLineRef = useRef<HTMLDivElement>(null);
  const glow1Ref = useRef<HTMLDivElement>(null);
  const glow2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;
    
    let rafId: number;
    let startTime = performance.now();
    let lastTick = 0;
    
    const tick = (now: number) => {
      // Throttle to ~30fps (33ms)
      if (now - lastTick < 33) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      lastTick = now;

      const time = (now - startTime) / 1000;
      const scrollY = window.scrollY;
      
      // Directly mutate DOM to bypass React render cycle overhead
      if (primaryGridRef.current) {
        primaryGridRef.current.style.transform = `perspective(1000px) rotateX(65deg) translateY(${-100 + scrollY * 0.1 + (time * 10 % 100)}px) scale(3)`;
      }
      if (secondaryGridRef.current) {
        secondaryGridRef.current.style.transform = `perspective(1000px) rotateX(65deg) translateY(${-100 + scrollY * 0.15 + (time * 20 % 100)}px) scale(3)`;
      }
      if (scanLineRef.current) {
        scanLineRef.current.style.top = `${((time * 15) % 150) - 20}%`;
        scanLineRef.current.style.opacity = `${0.5 + Math.sin(time * 5) * 0.2}`;
      }
      if (glow1Ref.current) {
        glow1Ref.current.style.transform = `translate(${Math.sin(time * 0.5) * 20}px, ${Math.cos(time * 0.3) * 20}px)`;
      }
      if (glow2Ref.current) {
        glow2Ref.current.style.transform = `translate(${Math.cos(time * 0.4) * 30}px, ${Math.sin(time * 0.6) * 30}px)`;
      }

      rafId = requestAnimationFrame(tick);
    };
    
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        startTime = performance.now();
        rafId = requestAnimationFrame(tick);
      } else {
        if (rafId) cancelAnimationFrame(rafId);
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      className={cn('pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#050505]', className)}
      aria-hidden="true"
    >
      {/* Primary Grid Layer */}
      <div
        ref={primaryGridRef}
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(232, 148, 58, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(232, 148, 58, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
          transformOrigin: 'center top',
          opacity: 0.4,
        }}
      />
      
      {/* Secondary Fine Grid Layer */}
      <div
        ref={secondaryGridRef}
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          transformOrigin: 'center top',
          opacity: 0.5,
        }}
      />

      {/* Horizontal Scanning Line */}
      <div 
        ref={scanLineRef}
        className="absolute inset-x-0 h-[2px] bg-primary/40 shadow-[0_0_20px_rgba(232,148,58,0.8)] mix-blend-screen"
      />

      {/* Vignette mask */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0A0A0A_70%)]" />

      {/* Dynamic Glow Nodes */}
      <div 
        ref={glow1Ref}
        className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full blur-3xl mix-blend-screen" 
        style={{ background: 'radial-gradient(circle, rgba(232,148,58,0.06), transparent 60%)' }} 
      />
      <div 
        ref={glow2Ref}
        className="absolute top-2/3 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl mix-blend-screen" 
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.02), transparent 70%)' }} 
      />
    </div>
  );
}
