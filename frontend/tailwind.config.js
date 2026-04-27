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
          black: '#121325',
          white: '#f0f0f2',
          lilac: '#9d84bf',
          purple: '#5c3a8c',
        }
      }
    },
  },
  plugins: [],
}