# Veil: Hide, Blur & Rewrite

A Chrome extension for picking any element on a web page and then hiding it, blurring it, or replacing its text. Your changes are saved and come back every time you visit.

## Install

1. Unzip `veil.zip` somewhere permanent. Chrome loads the extension from that folder, so don't delete it.
2. Open `chrome://extensions` and turn on **Developer mode** (top right).
3. Click **Load unpacked** and select the `veil` folder.
4. Pin Veil from the puzzle-piece menu.

Tabs that were already open start working the first time you use Veil in them. You can also reload those tabs.

## Use

There are three ways to start:

- Click the toolbar icon, then **Pick an element**.
- Press **Alt+Shift+V**.
- Right-click anything on the page and choose **Veil this element**. This skips the picker.

While picking:

| Key | Action |
|---|---|
| Click or Enter | Select the highlighted element |
| ↑ / ↓ | Move to the parent or child element |
| Esc or right-click | Cancel |

After you select an element, a panel appears.

- **This page / Whole site** sets where the change applies. Veil remembers your last choice.
- **Replace text** makes the element editable in place, so it keeps the site's font, size and color. Press Enter to save, Shift+Enter for a new line, and Esc to cancel.
- **Blur** shows a live preview. You can adjust the strength, and optionally have the element show clearly while you hover over it.
- **Hide** offers two modes. "Keep the space" leaves a blank gap. "Remove from the layout" lets the page close up around it.
- **Select parent / Select child** adjusts your selection without restarting the picker.

Every save shows an **Undo** button for 5 seconds.

To change a saved rule, select the same element again and apply the same action. Veil updates the existing rule instead of adding a duplicate.

## Hide all money on a page

In the popup, turn on **Hide money on this site**. Veil then finds every amount on the site's pages, including ones that load later, and covers them. The setting applies per site.

**What counts as money:**
- A currency symbol or code before or after a number: `$1,240.50`, `1.240,50 €`, `৳ 5,000`, `Tk 500`, `Rs. 2,500`, `USD 99`, `99 BDT`, `CHF 1'250.00`, `US$1,000`, `50¢`.
- Short forms: `$1.2k`, `€3M`, `₹3 lakh`.
- Amounts split across elements, such as `<span>$</span><span>1,240</span>`.
- Input fields whose value has a currency, or whose label, name or placeholder says price, amount, total and similar.
- **Optional:** plain numbers next to words like Total, Balance, Price, Revenue or Fee, including `Balance | 5,000` table cells. This is off by default because it catches more false positives.

Code blocks are skipped, and so are version numbers, years, percentages and phone numbers.

**Styles:**

| Style | Looks like | Changes the page? |
|---|---|---|
| Mask (default) | Solid grey bar over the amount | No. Uses Chrome's CSS Highlight API, so it's safe on React and Vue sites |
| Hide | Amount is invisible, space kept | No |
| Blur | Blurred, clear on hover | Yes. Each amount is wrapped in a `<veil-money>` tag, which can occasionally upset framework-rendered pages |

**Controls:**
- **Alt+Shift+M** shows the amounts on the current tab. Press it again to hide them.
- If something that isn't money gets covered, pick it (or right-click it and choose **Veil this element**), then click **Keep this visible when hiding money**. The popup shows how many elements are kept visible and lets you reset them.

**Won't be caught:**
- Amounts drawn inside `<canvas>` (many chart libraries) or in images.
- Amounts inside other sites' shadow DOM components.
- Text styled with gradient fills, which the mask can't cover.
- Numbers with no currency, when the plain-number setting is off.
- Amounts already on screen before the first scan. The scan starts early, but a brief flash is possible on slow pages.
- Mask and Hide have no hover reveal. Use the shortcut instead.

## Popup

The popup lists the site's rules in three groups: this page, the whole site, and other pages on the site. For each rule you can:

- Turn it on or off.
- Jump to the element on the page.
- Delete it.

The switch in the header pauses everything. **Alt+Shift+X** does the same thing.

**Export** and **Import** back up all rules as JSON. Importing merges with your existing rules and never overwrites them.

You can change shortcuts at `chrome://extensions/shortcuts`.

## How it works

- Rules are stored in `chrome.storage.local`, grouped by hostname. Page-scoped rules match on origin + path and ignore the query string and hash.
- Blur and hide are CSS injected at `document_start`, which avoids a flash of the original content in most cases.
- Text replacement runs in JavaScript. A MutationObserver re-applies it when the page re-renders (React, Vue and similar frameworks), and it also handles in-app navigation on single-page sites.
- Selectors prefer, in order:
  1. A stable `id`
  2. `data-testid` / `aria-label`-style attributes
  3. A short structural path
- Class names that look auto-generated (CSS-in-JS hashes, CSS module suffixes) are skipped. Each rule also stores the start of the element's original text as a fallback, used when the selector stops matching.

## Known limits

- **Rules can break when a site changes.** A redesign can make a selector stop matching. The text fallback recovers many of these cases, but not elements without text, such as images.
- **Lists that reorder can misfire.** A selector like "the 2nd card" may land on a different item when the list order changes.
- **Replaced text is visual only.** The original can still reach the site's own scripts, and it can reappear briefly before Veil re-applies. Don't rely on Veil to protect sensitive data during a screen share.
- **Replacing text on framework-rendered elements can occasionally break that part of the page**, because the framework expects the nodes it created. If this happens, delete the rule, or choose a smaller element that contains only text.
- **Iframes are not supported.** Veil works on the top-level page only.
- **Some pages are off limits.** Chrome blocks extensions on `chrome://` pages and the Web Store.
- **Permissions are broad.** Veil needs access to all http(s) sites so it can re-apply rules automatically. It makes no network requests, and all data stays on your machine.

## Files

```
manifest.json   MV3 manifest, permissions, shortcuts
background.js   context menu, shortcuts, toolbar badge
content.js      picker, panel, editor, rule engine, money detection
popup.html/css/js  rule manager
icons/          16, 32, 48, 128 px
```
