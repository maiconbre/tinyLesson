import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      fontSize: {
        'xs': '0.75rem',    // 12px
        'sm': '0.875rem',   // 14px
        'base': '1rem',     // 16px
        'lg': '1.125rem',   // 18px
        'xl': '1.25rem',    // 20px
        '2xl': '1.5rem',    // 24px
        '3xl': '1.875rem',  // 30px
        '4xl': '2.25rem',   // 36px
        '5xl': '3rem',      // 48px
        '6xl': '3.75rem',   // 60px
      },
      colors: {
        gold: {
          50: '#FFF8E1',  // Lighter, creamier base
          100: '#FFECB3', // Light gold
          200: '#FFE082', // Soft gold
          300: '#FFD54F', // Bright gold
          400: '#FFCA28', // Richer gold
          500: '#E6A000', // Target primary gold - richer, more orange
          600: '#D49400', // Darker gold
          700: '#B88000', // Deep gold
          800: '#9C6C00', // Very dark gold
          900: '#7F5800', // Deepest gold
        },
        dark: {
          50: '#ECEFF1',  // Lightest gray for text on dark primary
          100: '#CFD8DC', // Light gray
          200: '#B0BEC5', // Medium light gray
          300: '#90A4AE', // Gray
          400: '#78909C', // Darker gray
          500: '#607D8B', // Slate gray
          600: '#546E7A', // Deep slate gray
          700: '#455A64', // Very dark slate gray
          800: '#1A1A1A', // Darker background shade
          900: '#121212', // Dark theme background
        },
        teal: {
          50: '#E0F2F1',
          100: '#B2DFDB',
          200: '#80CBC4',
          300: '#4DB6AC',
          400: '#26A69A',
          500: '#007A7A', // Target accent teal
          600: '#006969',
          700: '#005858',
          800: '#004747',
          900: '#003636',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale': 'scale 0.2s ease-out',
        'bounce-scale': 'bounceScale 0.3s ease-out',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      boxShadow: {
        'input': '0 2px 4px rgba(0,0,0,0.1)',
        'hover': '0 8px 15px rgba(0,0,0,0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-shine': 'linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.1) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.1) 75%, rgba(255,255,255,0.1))',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scale: {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        bounceScale: {
          '0%': { transform: 'scale(0.9)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}
export default config
