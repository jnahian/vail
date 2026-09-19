# Changelog

All notable changes to Veil are recorded in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.3] - 2026-09-19

### Removed

- The `activeTab` permission. The host permissions already give Veil access to every http and https page, so `activeTab` added nothing.

## [1.0.2] - 2026-09-17

### Changed

- The release zip now holds only the extension files. It no longer includes the repository documentation, such as `README.md` and `CHANGELOG.md`.

## [1.0.1] - 2026-09-17

### Changed

- New deep teal brand color (`#0F766E`) for the icon, popup, on-page panel and picker.
- Shorter extension description, because the Chrome Web Store allows at most 132 characters.

### Fixed

- API keys and tokens inside code elements are now hidden.
- After an install, update or reload, Veil now really starts again in open tabs. The 1.0.0 release did not have the host permissions that this needs.

## [1.0.0] - 2026-09-17

### Added

- Element picker: select any element, then hide it, blur it, or replace its text, on one page or on the whole site.
- Sensitive data hiding per site, with Mask, Blur and Hide styles.
- Detectors for money, emails, phone numbers, card numbers, IBANs, API keys and tokens, and IP addresses.
- Custom words and `/patterns/` for sensitive data hiding.
- Money detection for Indian lakh grouping, such as `Rs. 1,00,000`.
- Shortcuts: Alt+Shift+V starts the picker, Alt+Shift+X pauses Veil, and Alt+Shift+M shows the hidden data on the current tab.
- Export and import of rules as JSON.
- Automatic restart in open tabs after Veil is installed, updated or reloaded.

### Fixed

- Pausing Veil now also stops sensitive data hiding.
- After a Veil reload, popup controls now keep working in tabs that were already open.

[Unreleased]: https://github.com/jnahian/vail/compare/v1.0.3...HEAD
[1.0.3]: https://github.com/jnahian/vail/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/jnahian/vail/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/jnahian/vail/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/jnahian/vail/releases/tag/v1.0.0
