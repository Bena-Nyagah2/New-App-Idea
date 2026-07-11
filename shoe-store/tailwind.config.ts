import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#fdedd6',
          200: '#fad9ac',
          300: '#f6c075',
          400: '#f1a13d',
          500: '#ed8914',
          600: '#e06d0f',
          700: '#b85010',
          800: '#934014',
          900: '#773514',
        },
        secondary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#E11D48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        accent: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563EB',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float 5s ease-in-out infinite',
        'float-delayed': 'float 3s ease-in-out 1s infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'bounce-subtle': 'bounceSubtle 1s ease-in-out infinite',
        'rotate-slow': 'rotateSlow 12s linear infinite',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        rotateSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(237, 137, 20, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(237, 137, 20, 0.6)' },
        },
      },
      boxShadow: {
        '3d': '8px 8px 0px 0px rgba(0,0,0,0.1)',
        '3d-lg': '12px 12px 0px 0px rgba(0,0,0,0.12)',
        '3d-hover': '4px 4px 0px 0px rgba(0,0,0,0.1)',
        'glow-primary': '0 0 30px rgba(237, 137, 20, 0.3)',
        'glow-secondary': '0 0 30px rgba(225, 29, 72, 0.3)',
        'float': '0 20px 60px -15px rgba(0, 0, 0, 0.15)',
        'float-lg': '0 30px 80px -20px rgba(0, 0, 0, 0.2)',
        'card-3d': '0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.08), 0 20px 48px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
