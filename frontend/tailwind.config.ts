import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0A',
        surface: '#141414',
        'surface-2': '#1A1A1A',
        'surface-3': '#222222',
        border: '#1C1C1C',
        primary: {
          DEFAULT: '#E8943A',
          hover: '#D47830',
          light: '#F0A850',
          glow: 'rgba(232,148,58,0.15)'
        },
        accent: '#E8943A',
        success: '#4ADE80',
        warning: '#FBBF24',
        danger: '#F87171',
        info: '#60A5FA',
        'text-primary': '#F5F0EB',
        'text-muted': '#8A8580',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-dot': 'pulseDot 2s infinite',
        'count-up': 'countUp 1s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'depth-reveal': 'depthReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float-3d': 'float3D 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(232, 148, 58, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(232, 148, 58, 0.4)' },
        },
        depthReveal: {
          '0%': { opacity: '0', transform: 'translateZ(-50px)' },
          '100%': { opacity: '1', transform: 'translateZ(0)' },
        },
        float3D: {
          '0%, 100%': { transform: 'translateY(0) translateZ(0) rotateX(0)' },
          '50%': { transform: 'translateY(-10px) translateZ(20px) rotateX(2deg)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
