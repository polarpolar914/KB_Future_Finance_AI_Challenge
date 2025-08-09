/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app.vue',
    './pages/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}',
    './components/**/*.{vue,js,ts}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#FFFAEA',
          100: '#FFF3CC',
          200: '#FFECAD',
          300: '#FEE383',
          400: '#FED95A',
          500: '#FED031',
          600: '#D8B12A',
          700: '#B29222',
          800: '#8C721B',
          900: '#665314',
        },
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(15,23,42,0.06)',
        'md': '0 4px 12px rgba(15,23,42,0.08)',
        'lg': '0 10px 24px rgba(15,23,42,0.12)'
      }
    },
  },
  plugins: [],
}
