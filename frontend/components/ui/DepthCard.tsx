'use client';
import { useRef, useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface DepthCardProps {
  children: React.ReactNode;
  className?: string;
  depth?: 'shallow' | 'medium' | 'deep';
  noPerspective?: boolean;
}

const depthConfig = {
  shallow: { maxTilt: 3, shadow: 15, z: 5, glare: 0.1 },
  medium: { maxTilt: 5, shadow: 25, z: 10, glare: 0.15 },
  deep: { maxTilt: 7, shadow: 40, z: 15, glare: 0.2 },
};

export default function DepthCard({ children, className, depth = 'medium', noPerspective }: DepthCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion } = useReducedMotion();
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const config = depthConfig[depth];
  const isDisabled = prefersReducedMotion || noPerspective;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDisabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    // Smooth tilt
    setStyle({
      transform: `perspective(1000px) rotateY(${x * config.maxTilt}deg) rotateX(${-y * config.maxTilt}deg) translateZ(${isHovered ? config.z : 0}px)`,
      boxShadow: `${-x * config.shadow}px ${y * config.shadow}px ${config.shadow * 2}px rgba(0,0,0,0.4), 0 0 ${config.shadow}px rgba(232,148,58,0.1)`,
    });

    // Dynamic glare effect mapping to mouse position
    const angle = Math.atan2(y, x) * (180 / Math.PI) - 90;
    setGlareStyle({
      background: `linear-gradient(${angle}deg, rgba(255,255,255,${config.glare}) 0%, rgba(255,255,255,0) 40%, rgba(232,148,58,${config.glare / 2}) 100%)`,
      opacity: 1,
      transform: 'translateZ(1px)', // keep above background, below content
    });
  }, [isDisabled, config, isHovered]);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setStyle({ transform: 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' });
    setGlareStyle({ opacity: 0 });
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative rounded-2xl overflow-hidden transition-all duration-300 ease-out will-change-transform group',
        className
      )}
      style={{
        ...style,
        transformStyle: 'preserve-3d',
        background: 'linear-gradient(145deg, rgba(30,30,30,0.7), rgba(15,15,15,0.95))',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Dynamic Specular Glare */}
      {!isDisabled && (
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 ease-out mix-blend-overlay"
          style={glareStyle} 
        />
      )}
      
      {/* Inner ambient glow (border highlight) */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" style={{ transform: 'translateZ(0px)' }} />

      {/* Content wrapper with slight z-translation to sit above the glare */}
      <div className="relative z-10 w-full h-full" style={{ transform: isDisabled ? 'none' : 'translateZ(20px)' }}>
        {children}
      </div>
    </div>
  );
}
