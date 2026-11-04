import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Development gallery only. No service worker or application runtime is shipped.
export default defineConfig({
  plugins: [react()],
  publicDir: false,
  // Scan the gallery, excluding package-consumer fixtures that require a build.
  optimizeDeps: { entries: ['index.html'] },
  build: { outDir: 'dist-preview' },
});
