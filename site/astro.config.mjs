// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Served by GitHub Pages at the custom domain https://vail.jnahian.me/
export default defineConfig({
  site: 'https://vail.jnahian.me',
  vite: {
    plugins: [tailwindcss()],
    // The page imports the store screenshots and icons from the repository root.
    server: { fs: { allow: ['..'] } },
  },
});
