/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js.jsx,ts,tsx}'],
  theme: {
    container: {
      center: true,
    },
    colors: {
      primary: '#deb522',
      secondary: '#128bb5',
      white: '#fff',
      black: '#0c0b00',
      lightBlack: '#121212',
      gray: '#4140409e',
    },
    extend: {
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
