// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Served by GitHub Pages at https://jnahian.github.io/vail/
export default defineConfig({
  site: 'https://jnahian.github.io',
  base: '/vail',
  vite: {
    plugins: [tailwindcss()],
    // The page imports the store screenshots and icons from the repository root.
    server: { fs: { allow: ['..'] } },
  },
});
