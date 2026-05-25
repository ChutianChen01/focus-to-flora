import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  // Change this to '/your-repository-name/' before deploying to GitHub Pages
  // if this repository is renamed.
  base: '/focus-to-flora/',
  build: {
    rollupOptions: {
      input: {
        app: resolve(__dirname, 'app.html'),
      },
    },
  },
});
