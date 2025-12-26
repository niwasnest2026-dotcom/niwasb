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
        // Teal-based SaaS color system
        primary: {
          DEFAULT: '#3AAFA9', // Primary teal
          dark: '#2B7A78',    // Secondary teal
          light: '#5BC5BF',   // Lighter teal
        },
        secondary: {
          DEFAULT: '#2B7A78', // Secondary teal
          dark: '#17252A',    // Dark navy
          light: '#3AAFA9',   // Primary teal
        },
        neutral: {
          DEFAULT: '#17252A', // Dark navy for text
          50: '#FEFFFF',      // Pure white
          100: '#DEF2F1',     // Soft teal
          200: '#B8E6E1',     // Light teal
          300: '#91DAD1',     // Medium teal
          400: '#6BCEC1',     // Teal
          500: '#3AAFA9',     // Primary teal
          600: '#2B7A78',     // Secondary teal
          700: '#1F5F5D',     // Dark teal
          800: '#17252A',     // Dark navy
          900: '#0F1B1E',     // Darker navy
          white: '#FEFFFF',   // Pure white
        },
        'soft-teal': '#DEF2F1',
        'pure-white': '#FEFFFF',
        'dark-navy': '#17252A',
        glass: {
          white: 'rgba(255, 255, 255, 0.7)',
          light: 'rgba(222, 242, 241, 0.5)',
          dark: 'rgba(222, 242, 241, 0.9)',
          teal: 'rgba(58, 175, 169, 0.1)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-teal': 'linear-gradient(135deg, #DEF2F1 0%, #FEFFFF 50%, #DEF2F1 100%)',
        'gradient-hero': 'linear-gradient(135deg, #3AAFA9 0%, #2B7A78 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(23, 37, 42, 0.1)',
        'glass-lg': '0 12px 48px 0 rgba(23, 37, 42, 0.15)',
        'glow-teal': '0 0 20px rgba(58, 175, 169, 0.4), 0 0 40px rgba(58, 175, 169, 0.2)',
        'glow-secondary': '0 0 15px rgba(43, 122, 120, 0.3), 0 0 30px rgba(43, 122, 120, 0.15)',
        'glow-navy': '0 0 15px rgba(23, 37, 42, 0.3), 0 0 30px rgba(23, 37, 42, 0.15)',
      },
      animation: {
        'gradient-shift': 'gradientShift 15s ease infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
