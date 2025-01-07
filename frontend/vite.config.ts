import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/log-web-vitals': 'http://localhost:500', // Adjust port to match your backend
    },
  },
});
