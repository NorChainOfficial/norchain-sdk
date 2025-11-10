/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B5CF6',
          light: '#A78BFA',
          dark: '#5B47ED',
        },
        background: {
          DEFAULT: '#1A0F3D',
          light: '#2D1B69',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #5B47ED 0%, #2D1B69 50%, #1A0F3D 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

