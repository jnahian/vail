# Changelog

All notable changes to Veil are recorded in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/jnahian/vail/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/jnahian/vail/releases/tag/v1.0.0
