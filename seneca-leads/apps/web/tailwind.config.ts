import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Navy/charcoal background per spec; gold accent #C9A55C.
        background: {
          DEFAULT: '#0A0F1E',
          card: '#111728',
          elevated: '#161D31',
        },
        border: {
          DEFAULT: '#1F2839',
          subtle: '#1A2230',
        },
        foreground: {
          DEFAULT: '#E8ECF4',
          muted: '#8A93A4',
          subtle: '#5A6477',
        },
        accent: {
          DEFAULT: '#C9A55C',
          hover: '#D4B36C',
          subtle: '#3A2E1A',
        },
        success: '#3FB68B',
        warning: '#E0A14C',
        danger: '#D9605F',
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Inter', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        // tighter scale for dense, Linear-style UI
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.8125rem', { lineHeight: '1.125rem' }],
        base: ['0.875rem', { lineHeight: '1.25rem' }],
        lg: ['1rem', { lineHeight: '1.375rem' }],
        xl: ['1.125rem', { lineHeight: '1.5rem' }],
        '2xl': ['1.375rem', { lineHeight: '1.75rem' }],
        '3xl': ['1.75rem', { lineHeight: '2.125rem' }],
      },
    },
  },
  plugins: [],
};

export default config;
