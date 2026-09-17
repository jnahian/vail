// Generates the Chrome Web Store images in store/assets/.
// Run with `npm run store:assets`. The screenshots show the real extension
// running in Chromium on store/pages/dashboard.html, with the real popup
// (popup.html) rendered from sample data and placed where Chrome opens it.
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(__dirname, 'assets');
const HOST = 'veil.test';
const PAGE = `http://${HOST}/dashboard.html`;
const POPUP_HEIGHT = 600; // Chrome caps popups at 600 px and scrolls the rest.

const ALL_TYPES = ['money', 'email', 'phone', 'card', 'iban', 'key', 'ip'];
const dataConfig = (patch) => ({
  enabled: true, style: 'mask', bare: false, blur: 6, excludes: [], types: ALL_TYPES, custom: [], ...patch,
});
const rule = (patch) => ({
  id: patch.selector.replace(/\W/g, ''), tag: 'div', fingerprint: '', label: patch.selector,
  scope: 'page', page: PAGE, enabled: true, createdAt: 1, ...patch,
});
const PAGE_RULES = [
  rule({ action: 'text', selector: '#greeting', tag: 'h1', label: 'h1#greeting', text: 'Good morning', createdAt: 3 }),
  rule({ action: 'blur', selector: '#avatar', label: 'div#avatar.avatar', blur: 10, reveal: true, createdAt: 2 }),
  rule({ action: 'hide', selector: '#banner', label: 'div#banner.banner', hideMode: 'collapse', createdAt: 1 }),
];

const dataUrl = (buf) => `data:image/png;base64,${buf.toString('base64')}`;

// popup.html with a stand-in chrome API, so the real popup renders sample data.
function popupHtml(state) {
  const stub = `<script>
    const store = ${JSON.stringify(state)};
    const chrome = {
      tabs: { query: async () => [{ id: 1, url: 'https://lumenbooks.example/overview' }], sendMessage: async () => true },
      scripting: { executeScript: async () => {} },
      commands: { getAll: async () => [
        { name: 'start-picker', shortcut: '⌥⇧V' }, { name: 'toggle-money-reveal', shortcut: '⌥⇧M' },
      ] },
      storage: {
        local: {
          get: async (k) => Object.fromEntries([].concat(k).filter((x) => x in store).map((x) => [x, store[x]])),
          set: async () => {}, remove: async () => {},
        },
        onChanged: { addListener() {} },
      },
    };
  </script>`;
  return fs.readFileSync(path.join(ROOT, 'popup.html'), 'utf8').replace('<link', `${stub}\n  <link`);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    viewport: { width: 1280, height: 800 },
    args: [`--disable-extensions-except=${ROOT}`, `--load-extension=${ROOT}`],
  });
  let popupState = {};
  await context.route(`http://${HOST}/**`, (route) => {
    const name = new URL(route.request().url()).pathname.slice(1);
    if (name === 'popup.html') return route.fulfill({ contentType: 'text/html', body: popupHtml(popupState) });
    const file = name === 'dashboard.html' ? path.join(__dirname, 'pages', name) : path.join(ROOT, name);
    return route.fulfill({ path: file });
  });
  const worker = context.serviceWorkers()[0] || (await context.waitForEvent('serviceworker'));
  const setStorage = (items) => worker.evaluate(async (i) => {
    await chrome.storage.local.clear();
    await chrome.storage.local.set(i);
  }, items);
  const sendToPage = (msg) => worker.evaluate(async (m) => {
    const [tab] = await chrome.tabs.query({ url: 'http://veil.test/dashboard.html' });
    await chrome.tabs.sendMessage(tab.id, m);
  }, msg);

  const page = await context.newPage();
  const popupPage = await context.newPage();
  await popupPage.setViewportSize({ width: 372, height: 1200 });
  const composer = await context.newPage();

  async function popup(state) {
    popupState = state;
    await popupPage.goto(`http://${HOST}/popup.html`);
    await popupPage.waitForTimeout(300);
    const box = await popupPage.locator('body').boundingBox();
    return popupPage.screenshot({ clip: { x: 0, y: 0, width: 372, height: Math.min(box.height, POPUP_HEIGHT) } });
  }

  async function shot(name, { storage, prepare, popupState: state }) {
    await setStorage(storage);
    await page.goto(PAGE);
    await page.waitForTimeout(400);
    if (prepare) await prepare();
    await page.waitForTimeout(300);
    const background = await page.screenshot();
    const overlay = state ? await popup(state) : null;
    await composer.setViewportSize({ width: 1280, height: 800 });
    await composer.setContent(`<body style="margin:0">
      <img src="${dataUrl(background)}" style="display:block">
      ${overlay ? `<img src="${dataUrl(overlay)}" style="position:absolute;top:8px;right:24px;border-radius:10px;
        box-shadow:0 12px 40px rgba(20,24,40,.28),0 0 0 1px rgba(20,24,40,.12)">` : ''}
    </body>`);
    await composer.screenshot({ path: path.join(OUT, `${name}.png`) });
    console.log(`Wrote store/assets/${name}.png`);
  }

  const hostKey = (k) => `${k}:${HOST}`;
  const popupKey = (k) => `${k}:lumenbooks.example`;

  await shot('screenshot-1-mask', {
    storage: { [hostKey('money')]: dataConfig() },
    popupState: { [popupKey('money')]: dataConfig() },
  });

  await shot('screenshot-2-blur', {
    storage: { [hostKey('money')]: dataConfig({ style: 'blur' }) },
    // Hovering an amount shows it clearly, as in Chrome.
    prepare: () => page.locator('veil-money', { hasText: '$48,210.75' }).hover(),
    popupState: { [popupKey('money')]: dataConfig({ style: 'blur', types: ['money', 'email', 'phone'] }) },
  });

  await shot('screenshot-3-picker', {
    storage: {},
    prepare: async () => {
      await sendToPage({ type: 'veil:pick' });
      await page.mouse.move(640, 400);
      await page.locator('.cards .card').first().hover();
    },
  });

  await shot('screenshot-4-panel', {
    storage: {},
    prepare: async () => {
      await sendToPage({ type: 'veil:pick' });
      await page.locator('#avatar').hover();
      await page.locator('#avatar').click();
      await page.locator('[data-act="blur"]').click();
      await page.mouse.move(1000, 700);
    },
  });

  await shot('screenshot-5-rules', {
    storage: { [hostKey('rules')]: PAGE_RULES },
    popupState: {
      [popupKey('rules')]: PAGE_RULES.map((r) => ({ ...r, page: 'https://lumenbooks.example/overview' })),
    },
  });

  // Store icon: the 128 px icon art scaled to 96 px, with 16 px of transparent padding.
  // The source art spans pixels 2 to 126, so it is scaled by 96 / 124.
  const icon = fs.readFileSync(path.join(ROOT, 'icons/icon128.png'));
  const scale = 96 / 124;
  await composer.setViewportSize({ width: 128, height: 128 });
  await composer.setContent(`<body style="margin:0;background:transparent">
    <img src="${dataUrl(icon)}" style="position:absolute;width:${128 * scale}px;left:${16 - 2 * scale}px;top:${16 - 2 * scale}px">
  </body>`);
  await composer.screenshot({ path: path.join(OUT, 'store-icon-128.png'), omitBackground: true });
  console.log('Wrote store/assets/store-icon-128.png');

  for (const [name, width, height] of [['promo-small-440x280', 440, 280], ['promo-marquee-1400x560', 1400, 560]]) {
    await composer.setViewportSize({ width, height });
    await composer.setContent(promoHtml(width, height, dataUrl(icon)));
    await composer.screenshot({ path: path.join(OUT, `${name}.png`) });
    console.log(`Wrote store/assets/${name}.png`);
  }

  await context.close();
}

// Promo tiles: the icon next to a card whose private values are masked or blurred.
// The store asks for little text, so the tile carries only the name.
function promoHtml(width, height, icon) {
  const u = height / 280; // scale everything from the small tile
  const row = (label, value, kind) => `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:${10 * u}px;padding:${7 * u}px 0;border-top:${u}px solid #eceef4">
      <span style="height:${7 * u}px;width:${label}px;border-radius:${4 * u}px;background:#d9dde8"></span>
      ${kind === 'mask'
        ? `<span style="height:${12 * u}px;width:${value * u}px;border-radius:${3 * u}px;background:#8a90a8"></span>`
        : `<span style="font:600 ${13 * u}px system-ui;color:#1e2340;filter:blur(${4 * u}px)">$${value},480.00</span>`}
    </div>`;
  return `<body style="margin:0;width:${width}px;height:${height}px;overflow:hidden;
      background:radial-gradient(circle at 20% 30%,#7a6cf0,#5b4bdb 45%,#3f31b8);font-family:system-ui">
    <div style="height:100%;display:flex;align-items:center;justify-content:center;gap:${40 * u}px">
    <div style="display:flex;flex-direction:column;align-items:center;gap:${10 * u}px">
      <img src="${icon}" style="width:${96 * u}px;height:${96 * u}px;filter:drop-shadow(0 ${6 * u}px ${14 * u}px rgba(0,0,0,.25))">
      <span style="color:#fff;font-weight:700;font-size:${30 * u}px;letter-spacing:-.01em">Veil</span>
    </div>
    <div style="transform:rotate(-3deg);width:${220 * u}px;background:#fff;border-radius:${14 * u}px;padding:${14 * u}px ${16 * u}px;
        box-shadow:0 ${18 * u}px ${40 * u}px rgba(20,16,70,.35)">
      <div style="height:${9 * u}px;width:${90 * u}px;border-radius:${5 * u}px;background:#1e2340;margin-bottom:${10 * u}px"></div>
      ${row(60 * u, 70, 'mask')}${row(44 * u, 12, 'blur')}${row(70 * u, 90, 'mask')}${row(52 * u, 48, 'blur')}${row(38 * u, 56, 'mask')}
    </div>
    </div>
  </body>`;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
