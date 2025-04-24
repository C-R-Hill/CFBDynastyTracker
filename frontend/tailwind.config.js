/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // We'll add team colors here dynamically
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 