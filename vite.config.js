import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Change this to '/your-repository-name/' before deploying to GitHub Pages
  // if this repository is renamed.
  base: '/focus-garden/',
});
