/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        jua: ['Jua', 'sans-serif'],
      },
      keyframes: {
        bob: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
      },
      animation: {
        bob: 'bob 3s ease-in-out infinite',
        'float-slow': 'floatSlow 4s ease-in-out infinite',
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
