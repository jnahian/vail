# Contributing to Veil

Veil is a small Chrome extension with no build step and no runtime dependencies. The only development dependency is Playwright, which runs the tests in Chromium.

By taking part, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Report a bug

Open an issue on GitHub and include this information:

- Your Chrome version and operating system.
- The page URL, or a small HTML page that shows the problem.
- What you did, what you expected, and what happened.
- Any errors from the page's DevTools console.

If the bug is a security problem, do not open an issue. Follow the [security policy](SECURITY.md).

## Set up

1. Fork the repository, then clone your fork.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and select the `extension` folder in the clone.
4. After each change, click the reload icon on the Veil card at `chrome://extensions`.
5. Install the test tools:

   ```bash
   npm install
   npx playwright install chromium
   ```

The files are described in the "Files" section of the [README](README.md#files).

## Make a change

1. Create a branch from `main`.
2. Keep each pull request to one topic.
3. Match the style of the code around your change. The code is plain JavaScript with no framework.
4. Do not add runtime dependencies or a build step.
5. Do not add network requests. All Veil data stays on the user's machine.
6. If you change what users see or do, update the [README](README.md).
7. Add a line under `## [Unreleased]` in the [changelog](CHANGELOG.md).

## Test-driven development

Veil uses test-driven development (TDD). For each change in behavior, do these steps:

1. Write one test for the new behavior.
2. Run the test, and make sure that it fails for the reason that you expect.
3. Write only enough code to make the test pass.
4. Run all the tests.
5. Repeat for the next behavior.

For a bug fix, first write a test that shows the bug.

The tests use two seams (public boundaries that do not change when the code inside them changes):

| Seam | What it covers | Location | Command |
|---|---|---|---|
| `compile(config).find(text)` in `extension/detect.js` | Sensitive data detection, including near misses | `tests/unit/` | `npm run test:unit` |
| The extension in Chromium | What a user sees on a page: rules, sensitive data styles, pause, and reloads | `tests/e2e/` | `npm run test:e2e` |

Test through these seams, not through the internal functions of `extension/content.js`. If a change needs a new seam, discuss it in the issue or pull request first.

Run all the tests before you open a pull request:

```bash
npm test
```

GitHub Actions runs the same command on each pull request.

Some behavior has no automated test, such as the picker, the popup and the keyboard shortcuts. If you change it, test it by hand in Chrome, and list the steps in the pull request description.

## Commit messages

Write the first line in the imperative mood, in 72 characters or fewer, for example "Add IPv6 detector". If the reason for the change is not obvious, explain it in the body.

## License

Your contributions are licensed under the [MIT License](LICENSE), which is the license of the project.
