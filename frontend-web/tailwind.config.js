/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        eco: {
          50: '#f1f8e9',
          100: '#c8e6c9',
          500: '#4caf50',
          700: '#2e7d32',
          900: '#1b5e20',
          darkBg: '#0b0f0b',
          darkCard: '#131913',
          darkBorder: '#1c241c',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
