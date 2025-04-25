/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        secondary: 'var(--secondary-color)',
      },
      textShadow: {
        'contrast': '0 0 2px rgba(0, 0, 0, 0.6), 0 0 2px rgba(0, 0, 0, 0.6), 0 0 2px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    function ({ addUtilities }) {
      const newUtilities = {
        // For large text (headers)
        '.text-contrast-lg': {
          'text-shadow': '0 0 2px rgba(0, 0, 0, 0.6), 0 0 2px rgba(0, 0, 0, 0.6)',
          '-webkit-text-stroke': '1px rgba(0, 0, 0, 0.3)',
        },
        // For medium text
        '.text-contrast-md': {
          'text-shadow': '0 0 1px rgba(0, 0, 0, 0.5)',
          '-webkit-text-stroke': '0.5px rgba(0, 0, 0, 0.25)',
        },
        // For small text
        '.text-contrast-sm': {
          'text-shadow': '0 0 1px rgba(0, 0, 0, 0.4)',
          '-webkit-text-stroke': '0.25px rgba(0, 0, 0, 0.2)',
        },
        // Outline-only options for better clarity
        '.text-outline-lg': {
          '-webkit-text-stroke': '1px rgba(0, 0, 0, 0.3)',
        },
        '.text-outline-md': {
          '-webkit-text-stroke': '0.5px rgba(0, 0, 0, 0.25)',
        },
        '.text-outline-sm': {
          '-webkit-text-stroke': '0.25px rgba(0, 0, 0, 0.2)',
        },
      }
      addUtilities(newUtilities)
    },
  ],
} 