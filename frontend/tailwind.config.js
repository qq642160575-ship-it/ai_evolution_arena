/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          blue: '#00f0ff',
          pink: '#ff003c',
          yellow: '#fcee0a',
          dark: '#050a0e',
          panel: '#0c131d',
        }
      },
      fontFamily: {
        sans: ['"Outfit"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Syncopate"', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(to right, #111827 1px, transparent 1px), linear-gradient(to bottom, #111827 1px, transparent 1px)',
        'neon-gradient': 'linear-gradient(90deg, #ff003c, #00f0ff)',
      },
      boxShadow: {
        'cyber-blue': '0 0 10px #00f0ff, 0 0 20px #00f0ff',
        'cyber-pink': '0 0 10px #ff003c, 0 0 20px #ff003c',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s infinite',
        'flicker': 'flicker 0.15s infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        },
        'flicker': {
          '0%, 100%': { opacity: 1 },
          '95%': { opacity: 0.9 },
          '97%': { opacity: 0.3 },
          '99%': { opacity: 0.8 },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' }
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    },
  },
  plugins: [],
}
