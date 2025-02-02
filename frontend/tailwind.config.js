/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#ffa07a',
        background: '#1a1a1d',
        surface: '#2a2a2d',
        'surface-light': '#333336',
      },
    },
  },
  plugins: [],
}

