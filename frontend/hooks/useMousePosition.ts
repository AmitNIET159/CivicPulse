'use client';

import { useState, useEffect, useRef, RefObject } from 'react';
import { useReducedMotion } from './useReducedMotion';

interface MousePosition {
  x: number; // -1 to 1
  y: number; // -1 to 1
  elementRef: RefObject<HTMLElement>;
}

export function useMousePosition<T extends HTMLElement = HTMLDivElement>(): MousePosition {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const elementRef = useRef<T>(null);
  const { prefersReducedMotion } = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || !elementRef.current) return;

    let requestRef: number;
    const element = elementRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      if (requestRef) {
        cancelAnimationFrame(requestRef);
      }

      requestRef = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        
        // Calculate center
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate distance from center normalized to -1 to 1
        const x = (e.clientX - centerX) / (rect.width / 2);
        const y = (e.clientY - centerY) / (rect.height / 2);

        // Clamp values
        setPosition({
          x: Math.max(-1, Math.min(1, x)),
          y: Math.max(-1, Math.min(1, y)),
        });
      });
    };

    const handleMouseLeave = () => {
      if (requestRef) {
        cancelAnimationFrame(requestRef);
      }
      requestRef = requestAnimationFrame(() => {
        setPosition({ x: 0, y: 0 });
      });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (requestRef) {
        cancelAnimationFrame(requestRef);
      }
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [prefersReducedMotion]);

  return { ...position, elementRef: elementRef as unknown as RefObject<HTMLElement> };
}
