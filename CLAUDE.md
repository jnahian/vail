# Veil

Chrome extension (Manifest V3, plain JavaScript, no build step). See README.md for features and CONTRIBUTING.md for the workflow.

## Test-driven development

Follow TDD for every behavior change and bug fix:

1. Write one failing test at an agreed seam, run it, and confirm it fails for the expected reason.
2. Write only enough code to make it pass, then run the suite.
3. Repeat, one test at a time. Refactor only after the tests are green.

For a bug, first write a test that reproduces it.

Seams:

- `detect.js` `compile(config).find(text)`: unit tests in `tests/unit/`, run with `npm run test:unit`.
- Page behavior in real Chromium with the extension loaded: Playwright tests in `tests/e2e/`, run with `npm run test:e2e`. Use the fixtures in `tests/e2e/fixtures.js` and test pages in `tests/e2e/pages/`.

Ask before adding a test at a new seam. Test through these interfaces, not through internals of `content.js`.

Run `npm test` before every commit.

## Landing page

`site/` is the landing page, built with Astro and Tailwind CSS and deployed to GitHub Pages at https://vail.jnahian.me/ by `.github/workflows/deploy-site.yml`. It has its own `package.json`. Run `npm run build` in `site/` before you commit changes there. The page imports its images from `icons/` and `store/assets/`, so run `npm run store:assets` first when the extension UI changes.
