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
        // Modern Gen-Z Blue & Orange color system
        primary: {
          DEFAULT: '#FF6711', // Bright Orange - Primary CTAs
          dark: '#E55A0F',    // Darker Orange
          light: '#FF8A42',   // Lighter Orange
        },
        secondary: {
          DEFAULT: '#63B3ED', // Sky Blue - Backgrounds & sections
          dark: '#2D3748',    // Deep Navy Blue
          light: '#90CDF4',   // Lighter Sky Blue
        },
        accent: {
          DEFAULT: '#FFD082', // Peach/Muted Orange - Highlights
          light: '#FFF4EC',   // Very light peach
          dark: '#F7A072',    // Darker peach
        },
        neutral: {
          DEFAULT: '#2D3748', // Deep Navy for text
          50: '#F7FAFC',      // Off-white
          100: '#EDF2F7',     // Light gray
          200: '#E2E8F0',     // Gray
          300: '#CBD5E0',     // Medium gray
          400: '#A0AEC0',     // Dark gray
          500: '#718096',     // Darker gray
          600: '#4A5568',     // Navy gray
          700: '#2D3748',     // Deep Navy
          800: '#1A202C',     // Darker Navy
          900: '#171923',     // Darkest Navy
          white: '#F7FAFC',   // Off-white
        },
        blue: {
          light: '#F7FAFC',   // Light blue background
          sky: '#63B3ED',     // Sky blue
          navy: '#2D3748',    // Deep navy
          dark: '#1A202C',    // Dark navy
        },
        orange: {
          bright: '#FF6711',  // Bright orange
          muted: '#FFD082',   // Muted peach
          light: '#FFF4EC',   // Light peach
        },
        glass: {
          white: 'rgba(247, 250, 252, 0.8)',
          light: 'rgba(237, 242, 247, 0.6)',
          dark: 'rgba(45, 55, 72, 0.9)',
          blue: 'rgba(99, 179, 237, 0.1)',
          orange: 'rgba(255, 103, 17, 0.1)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-blue': 'linear-gradient(135deg, #63B3ED 0%, #90CDF4 50%, #63B3ED 100%)',
        'gradient-hero': 'linear-gradient(135deg, #FF6711 0%, #E55A0F 100%)',
        'gradient-navy': 'linear-gradient(135deg, #2D3748 0%, #1A202C 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(45, 55, 72, 0.1)',
        'glass-lg': '0 12px 48px 0 rgba(45, 55, 72, 0.15)',
        'glow-orange': '0 0 20px rgba(255, 103, 17, 0.4), 0 0 40px rgba(255, 103, 17, 0.2)',
        'glow-blue': '0 0 15px rgba(99, 179, 237, 0.3), 0 0 30px rgba(99, 179, 237, 0.15)',
        'glow-navy': '0 0 15px rgba(45, 55, 72, 0.3), 0 0 30px rgba(45, 55, 72, 0.15)',
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
