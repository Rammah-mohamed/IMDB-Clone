import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import compression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: 'gzip', // Use 'brotliCompress' for Brotli compression
      ext: '.gz', // The file extension for compressed files
      threshold: 10240, // Minimum file size (in bytes) to compress
      deleteOriginFile: false, // Set to true to delete the original uncompressed files
    }),
  ],
  server: {
    proxy: {
      '/log-web-vitals': 'http://localhost', // Adjust port to match your backend
    },
  },
});
