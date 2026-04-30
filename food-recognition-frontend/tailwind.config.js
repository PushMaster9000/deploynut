/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // <--- THIS IS CRITICAL
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // We keep your custom colors, but we will use them with 'dark:' prefix
        'dark-bg': '#0B0F19',       
        'dark-card': '#111827',     
        'dark-border': '#1F2937',   
        'brand-green': '#10b981',   
        'brand-green-hover': '#059669',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}