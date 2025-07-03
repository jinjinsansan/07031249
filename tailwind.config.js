/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Noto Sans JP', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
        'jp': ['Noto Sans JP', 'sans-serif'],
      },
      fontWeight: {
        'jp-light': '300',
        'jp-normal': '400',
        'jp-medium': '500',
        'jp-semibold': '600',
        'jp-bold': '700',
      },
      letterSpacing: {
        'jp': '0.02em',
        'jp-wide': '0.05em',
      },
      lineHeight: {
        'jp': '1.6',
        'jp-relaxed': '1.8',
      }
    },
  },
  plugins: [],
};