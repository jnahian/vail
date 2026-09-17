# Contributing to Veil

Veil is a small Chrome extension with no build step and no dependencies. You edit the files, reload the extension, and test in Chrome.

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
3. Click **Load unpacked** and select the cloned folder.
4. After each change, click the reload icon on the Veil card at `chrome://extensions`.

The files are described in the "Files" section of the [README](README.md#files).

## Make a change

1. Create a branch from `main`.
2. Keep each pull request to one topic.
3. Match the style of the code around your change. The code is plain JavaScript with no framework.
4. Do not add dependencies or a build step.
5. Do not add network requests. All Veil data stays on the user's machine.
6. If you change what users see or do, update the [README](README.md).
7. Add a line under `## [Unreleased]` in the [changelog](CHANGELOG.md).

## Test

The project has no automated tests, so you test by hand in Chrome. Before you open a pull request, do these steps:

1. Run `node --check` on each JavaScript file that you changed.
2. Reload the extension and one open tab. Make sure that the popup still opens and shows the site's rules.
3. Pick an element and apply each action: replace text, blur, and hide.
4. If you changed sensitive data detection, test the changed type on a page that has matches. Then test it on a page with near misses, such as dates and version numbers.
5. Test on one single-page app, such as a React site, because those pages re-render often.

In the pull request description, list the sites and steps that you tested.

## Commit messages

Write the first line in the imperative mood, in 72 characters or fewer, for example "Add IPv6 detector". If the reason for the change is not obvious, explain it in the body.

## License

Your contributions are licensed under the [MIT License](LICENSE), which is the license of the project.
