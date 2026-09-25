# Security policy

## Supported versions

Only the latest release receives security fixes.

| Version | Supported |
|---|---|
| 1.0.x | Yes |

## Report a vulnerability

Do not open a public issue for a security problem.

Report it privately through GitHub:

1. Go to the [Security tab](https://github.com/jnahian/veil-chrome-ext/security) of this repository.
2. Click **Report a vulnerability**.
3. Describe the problem, the affected version, and the steps to reproduce it.

The maintainer replies within 7 days. After the maintainer confirms the problem, a fix is released as soon as possible. The advisory credits you unless you ask not to be credited.

## Scope

These are examples of problems that are in scope:

- A web page that can read, change or delete Veil rules.
- A web page that can run code in the extension's context.
- An imported rules file that can inject CSS or scripts into other sites.
- Sensitive data that Veil shows although the user chose to hide it, because of a flaw in the hiding code.

These are examples of problems that are out of scope:

- A detector that misses a value in a format that the [README](README.md) does not list.
- Data that the page's own scripts can still read. Veil hides data visually only, as the README states.

## Design limits

Veil is a visual privacy tool. It does not remove data from the page, from network traffic, or from the site's scripts. Do not use it as the only protection for secrets during a screen share.
