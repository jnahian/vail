const { test, expect, HOST, dataConfig } = require('./fixtures');

// Text wrapped by the Blur style, which the page can observe directly.
const blurred = (page) => page.locator('veil-money');

test('blur style wraps and blurs each amount', async ({ page, store }) => {
  await store(dataConfig({ style: 'blur' }));
  await page.goto(`http://${HOST}/data.html`);

  await expect(blurred(page)).toHaveText(['$1,240.50']);
  await expect(blurred(page)).toHaveCSS('filter', 'blur(6px)');
});

test('blur stays blurred on hover unless hover reveal is on', async ({ page, store }) => {
  await store(dataConfig({ style: 'blur' }));
  await page.goto(`http://${HOST}/data.html`);
  await expect(blurred(page)).toHaveCSS('filter', 'blur(6px)');

  await blurred(page).hover();
  await page.waitForTimeout(400); // longer than the filter transition

  await expect(blurred(page)).toHaveCSS('filter', 'blur(6px)');
});

test('turning hover reveal on clears the blur on hover, without a reload', async ({ page, store }) => {
  await store(dataConfig({ style: 'blur' }));
  await page.goto(`http://${HOST}/data.html`);
  await expect(blurred(page)).toHaveCSS('filter', 'blur(6px)');

  await store(dataConfig({ style: 'blur', hoverReveal: true }));
  await expect(blurred(page)).toHaveCount(1); // the rescan rewraps the amount
  await blurred(page).hover();

  await expect(blurred(page)).toHaveCSS('filter', 'none');
});

// Text covered by the Mask and Hide styles, which use the CSS Highlight API.
const highlighted = (page) =>
  page.evaluate(() => [...(CSS.highlights.get('veil-money') ?? [])].map((r) => r.toString()));

test('mask style covers each selected type and leaves other text alone', async ({ page, store }) => {
  await store(dataConfig({ types: ['money', 'email'] }));
  await page.goto(`http://${HOST}/data.html`);

  await expect.poll(() => highlighted(page)).toEqual(['$1,240.50', 'jane@example.com']);
  await expect(blurred(page)).toHaveCount(0);
});

test('amounts added after the page loads are covered too', async ({ page, store }) => {
  await store(dataConfig());
  await page.goto(`http://${HOST}/data.html`);
  await expect.poll(() => highlighted(page)).toEqual(['$1,240.50']);

  await page.evaluate(() => {
    const p = document.createElement('p');
    p.textContent = 'Refund €99.00 sent';
    document.body.append(p);
  });

  await expect.poll(() => highlighted(page)).toEqual(['$1,240.50', '€99.00']);
});

test('turning the feature off uncovers the page without a reload', async ({ page, store }) => {
  await store(dataConfig({ style: 'blur' }));
  await page.goto(`http://${HOST}/data.html`);
  await expect(blurred(page)).toHaveCount(1);

  await store(dataConfig({ style: 'blur', enabled: false }));

  await expect(blurred(page)).toHaveCount(0);
  await expect(page.locator('#money')).toHaveText('Balance $1,240.50 due');
});

test('pausing Veil uncovers the data, and resuming covers it again', async ({ page, store }) => {
  await store(dataConfig());
  await page.goto(`http://${HOST}/data.html`);
  await expect.poll(() => highlighted(page)).toEqual(['$1,240.50']);

  await store({ paused: true });
  await expect.poll(() => highlighted(page)).toEqual([]);

  await store({ paused: false });
  await expect.poll(() => highlighted(page)).toEqual(['$1,240.50']);
});

test('API keys inside code elements are covered, but other types in code are not', async ({ page, store }) => {
  await store(dataConfig({ types: ['money', 'key'] }));
  await page.goto(`http://${HOST}/data.html`);

  await expect.poll(() => highlighted(page)).toEqual(['$1,240.50', 'sk_live_abc123def456']);
});
