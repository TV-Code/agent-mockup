/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#ffd4b8',
          300: '#ffb088',
          400: '#ffa07a', // Our main brand color
          500: '#ff7a50',
          600: '#ed5f3d',
          700: '#dc4b2f',
          800: '#b93d27',
          900: '#963524',
        },
        surface: {
          DEFAULT: '#1a1a1d',
          50: '#2a2a2d',
          100: '#232326',
          200: '#1e1e20',
          300: '#19191b',
          400: '#141415',
        },
        glass: {
          DEFAULT: 'rgba(26, 26, 29, 0.8)',
          light: 'rgba(255, 255, 255, 0.03)',
          stroke: 'rgba(255, 255, 255, 0.08)',
        }
      },
      boxShadow: {
        'premium': '0 8px 24px -4px rgba(0, 0, 0, 0.3)',
        'glow': '0 0 24px rgba(255, 160, 122, 0.15)',
      }
    },
  },
  plugins: [],
}

