/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        cream: {
          50: '#fdfcf9',
          100: '#faf8f2',
          200: '#f5f1e8',
          300: '#ece4d4',
          400: '#dfd3be',
        },
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        dark: {
          700: '#232d3f',
          800: '#161d2a',
          850: '#111722',
          900: '#0b0f17',
          950: '#070a10',
        }
      }
    },
  },
  plugins: [],
}
