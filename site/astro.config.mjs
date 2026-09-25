// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
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

// Drops the changelog's "Unreleased" section from the site. The file keeps it for the release steps.
const hideUnreleased = {
  name: 'hide-unreleased',
  before(root, ctx) {
    let hiding = false;
    for (const node of [...root.children]) {
      if (node.tagName === 'h2') hiding = ctx.textContent(node).trim() === 'Unreleased';
      if (hiding) ctx.removeNode(node);
    }
  },
};

// Served by GitHub Pages at the custom domain https://veil-ce.jnahian.me/
export default defineConfig({
  site: 'https://veil-ce.jnahian.me',
  integrations: [sitemap()],
  markdown: { processor: satteri({ hastPlugins: [githubLinksInNewTab, hideUnreleased] }) },
  vite: {
    plugins: [tailwindcss()],
    // The page imports the store screenshots and icons from the repository root.
    server: { fs: { allow: ['..'] } },
  },
});
