/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        todo: {
          red: '#e74444',
          orange: '#f5a623',
          yellow: '#f5b829',
          green: '#5cbd5c',
          blue: '#4f7dff',
          purple: '#9b84ec',
          gray: '#9e9e9e',
        },
      },
    },
  },
  plugins: [],
}