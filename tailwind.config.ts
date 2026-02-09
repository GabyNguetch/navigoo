import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#9400D3', // Dark Violet
          dark: '#7200a3',
          light: '#b64dff',
          50: '#f5e6ff',
          100: '#e6ccff',
          200: '#cc99ff',
          300: '#b366ff',
          400: '#9933ff',
          500: '#9400D3',
          600: '#7a00b3',
          700: '#610099',
          800: '#470080',
          900: '#2e0066',
        },
        secondary: {
          DEFAULT: '#8A2BE2', // Blue Violet
          dark: '#6a1fb8',
          light: '#a855f7',
        }
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [], // Laissez le tableau vide ici pour Tailwind v4
};

export default config;