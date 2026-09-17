// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { satteri } from '@astrojs/markdown-satteri';

// Opens GitHub links in the Markdown pages (privacy policy, changelog) in a new tab.
const githubLinksInNewTab = {
  name: 'github-links-in-new-tab',
  element: {
    filter: ['a'],
    visit(node, ctx) {
      if (!String(node.properties.href).startsWith('https://github.com/')) return;
      ctx.setProperty(node, 'target', '_blank');
      ctx.setProperty(node, 'rel', ['noopener']);
    },
  },
};

// Served by GitHub Pages at the custom domain https://vail.jnahian.me/
export default defineConfig({
  site: 'https://vail.jnahian.me',
  markdown: { processor: satteri({ hastPlugins: [githubLinksInNewTab] }) },
  vite: {
    plugins: [tailwindcss()],
    // The page imports the store screenshots and icons from the repository root.
    server: { fs: { allow: ['..'] } },
  },
});
