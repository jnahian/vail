# Veil landing page

The landing page for Veil, built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com). GitHub Actions deploys it to <https://vail.jnahian.me/> after each change on `main`.

## Develop

Run these commands in this folder:

```bash
npm install
npm run dev
```

Then open <http://localhost:4321/>.

## Build

```bash
npm run build
```

The page uses the extension icons from `../extension/icons/` and the store screenshots from `../store/assets/`. To update the screenshots, run `npm run store:assets` in the repository root.
