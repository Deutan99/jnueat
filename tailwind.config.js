/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        jua: ['Jua', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#2183dd',
          dark: '#1565b0',
          accent: '#fce300',
        },
        mandarin: {
          DEFAULT: '#ff8a3d',
          dark: '#e8731f',
          soft: '#ffe4cc',
        },
        cream: {
          DEFAULT: '#fff7ec',
          dark: '#f4ead8',
        },
      },
    },
  },
  plugins: [],
};
