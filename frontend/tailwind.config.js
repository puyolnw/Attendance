/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark surfaces
        base:     '#0a0e14',
        surface:  '#111721',
        elevated: '#1a2230',
        overlay:  '#232b3a',
        border:   '#232b3a',
        'border-strong': '#2f3a4d',

        // Text
        ink:       '#e6edf3',
        'ink-dim': '#a3b1c2',
        muted:     '#6b7a8f',

        // Neon accents
        accent: {
          DEFAULT: '#00e5c7',
          hover:   '#2af0d6',
          dim:     'rgba(0,229,199,0.12)',
          ring:    'rgba(0,229,199,0.35)',
        },
        indigo: {
          DEFAULT: '#6366f1',
          hover:   '#818cf8',
          dim:     'rgba(99,102,241,0.14)',
        },

        // Status
        ok:    '#22c55e',
        warn:  '#f59e0b',
        bad:   '#ef4444',
        info:  '#38bdf8',
      },
      boxShadow: {
        glow:      '0 0 0 1px rgba(0,229,199,0.25), 0 0 24px -4px rgba(0,229,199,0.35)',
        'glow-sm': '0 0 16px -6px rgba(0,229,199,0.5)',
        card:      '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.6)',
        elevated:  '0 12px 40px -16px rgba(0,0,0,0.7)',
      },
      backgroundImage: {
        'grid-fade': 'radial-gradient(circle at 50% 0%, rgba(99,102,241,0.10), transparent 55%)',
        'accent-gradient': 'linear-gradient(135deg, #00e5c7 0%, #6366f1 100%)',
      },
      fontFamily: {
        sans: ['Kanit', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        serif: ['Sarabun', 'serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      keyframes: {
        'fade-in':   { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        'slide-up':  { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        'pulse-ring':{ '0%,100%': { opacity: 0.4 }, '50%': { opacity: 1 } },
      },
      animation: {
        'fade-in':  'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.35s cubic-bezier(0.16,1,0.3,1)',
        'pulse-ring':'pulse-ring 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
