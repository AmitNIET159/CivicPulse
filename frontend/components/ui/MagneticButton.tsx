'use client';
import { useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  type?: 'button' | 'submit';
}

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20',
  secondary: 'border border-white/[0.1] text-text-primary hover:border-primary/30 hover:bg-surface',
  ghost: 'text-text-muted hover:text-text-primary',
};

export default function MagneticButton({ children, className, onClick, href, variant = 'primary', disabled, type = 'button' }: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null);
  const { prefersReducedMotion } = useReducedMotion();
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (prefersReducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.15;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.15;
    setOffset({ x, y });
  }, [prefersReducedMotion]);

  const handleMouseLeave = useCallback(() => setOffset({ x: 0, y: 0 }), []);

  const baseClass = cn(
    'inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300 ease-out',
    variants[variant],
    disabled && 'opacity-50 cursor-not-allowed',
    className
  );

  const style: React.CSSProperties = {
    transform: `translate(${offset.x}px, ${offset.y}px)`,
  };

  if (href && !disabled) {
    return (
      <Link href={href} ref={ref as any} className={baseClass} style={style} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        {children}
      </Link>
    );
  }

  return (
    <button ref={ref as any} type={type} className={baseClass} style={style} onClick={onClick} disabled={disabled} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      {children}
    </button>
  );
}
