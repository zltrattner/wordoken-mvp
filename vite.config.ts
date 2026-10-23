import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Development gallery only. No service worker or application runtime is shipped.
export default defineConfig({
  plugins: [react()],
  publicDir: false,
  build: { outDir: 'dist-preview' },
});
