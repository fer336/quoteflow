/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#081b26',
          blue: '#025373',
          cyan: '#04b2d9',
          light: '#049dd9',
        }
      }
    },
  },
  plugins: [],
}