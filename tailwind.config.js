/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'danger': '#DC2626',
        'danger-hover': '#B91C1C',
      }
    },
  },
  plugins: [],
}
