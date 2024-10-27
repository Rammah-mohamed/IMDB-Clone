/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '8rem',
    },
    colors: {
      primary: '#deb522',
      secondary: {
        DEFAULT: '#128bb5',
        100: '#128bb521',
      },
      white: '#fff',
      black: {
        DEFAULT: '#000',
        100: '#121212',
        transparent: '#00000087',
      },
      gray: {
        DEFAULT: '#4140409e',
        100: '#f6f6f6',
        200: '#eee',
        250: '#dedede',
        300: '#777',
        400: '#1F1F1F',
      },
      overlay: '#11111130',
    },
    extend: {
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
      },
      flex: {
        2: '2 2 0%',
        3: '3 3 0%',
        4: '4 4 0%',
      },
    },
  },
  plugins: [],
};
