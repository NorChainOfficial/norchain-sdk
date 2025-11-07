import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // BNB-inspired brand colors
        bnb: {
          yellow: '#FFE900',
          green: '#18DC7E',
          dark: '#14151A',
          'dark-secondary': '#181A1E',
        },
        // Extended color palette for gradients
        bitcoin: {
          orange: '#F7931A',
          gold: '#FFB300',
        },
      },
      backgroundImage: {
        'gradient-bnb': 'linear-gradient(135deg, #FFE900 0%, #18DC7E 100%)',
        'gradient-bnb-reverse': 'linear-gradient(135deg, #18DC7E 0%, #FFE900 100%)',
        'gradient-dark': 'linear-gradient(135deg, #14151A 0%, #181A1E 100%)',
        'grid-pattern': 'linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.5s ease-in-out',
        'slideIn': 'slideIn 0.3s ease-out',
        'slideUp': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 233, 0, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 233, 0, 0.8)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      boxShadow: {
        'bnb-glow': '0 0 30px rgba(255, 233, 0, 0.3)',
        'bnb-glow-lg': '0 0 50px rgba(255, 233, 0, 0.4)',
        'green-glow': '0 0 30px rgba(24, 220, 126, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
export default config;
