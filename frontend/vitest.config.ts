// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './setupTests.ts', // Path to your setupTests file
    coverage: {
      reporter: ['text', 'json', 'html'], // Generates reports in multiple formats
      reportsDirectory: './coverage', // Directory for coverage reports
      include: ['src/**/*.{tsx}'], // Include all TS/TSX files
      exclude: ['**/*.test.tsx'],
    },
  },
});
