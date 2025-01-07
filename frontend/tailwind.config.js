/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '8rem',
    },
    colors: {
      primary: '#E2B616',
      secondary: {
        DEFAULT: '#0E63BE',
        100: '#128bb521',
      },
      white: { DEFAULT: '#fff' },
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
        350: '#373737',
        400: '#1F1F1F',
      },
      overlay: { DEFAULT: '#11111130', 50: '#11111150', 60: '#11111160', 70: '#11111170' },
      green: '#66AB58',
      red: 'red',
    },
    extend: {
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
      },
      flex: {
        2: '2 0 0%',
        2.5: '2.5 0 0%',
        3: '3 0 0%',
        4: '4 0 0%',
      },
    },
  },
  variants: {
    extend: {
      borderColor: ['focus'], // Ensure the `focus` variant is enabled for `borderColor`
    },
  },
  plugins: [],
};
