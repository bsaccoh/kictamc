/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#142D4E',
          institutional: '#142D4E',
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#627D98',
          500: '#1B365D',
          600: '#142D4E',
          700: '#102A43',
          800: '#0B2545',
          900: '#07192C',
          950: '#040F1D',
        },
        gold: {
          DEFAULT: '#C69A43',
          institutional: '#C69A43',
          50: '#FDFBF4',
          100: '#F9F2DC',
          200: '#F3E5B8',
          300: '#EBD691',
          400: '#D9B35C',
          500: '#C69A43',
          600: '#B38533',
          700: '#916723',
          800: '#704E17',
          900: '#4E340E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
