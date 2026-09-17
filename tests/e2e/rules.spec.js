const { test, expect, HOST } = require('./fixtures');

const PAGE = `http://${HOST}/rules.html`;
const OTHER = `http://${HOST}/other.html`;

// A saved rule as the picker creates it.
const rule = (patch) => ({
  id: patch.id || patch.selector.replace(/\W/g, ''),
  tag: 'div',
  fingerprint: '',
  label: patch.selector,
  scope: 'site',
  page: PAGE,
  enabled: true,
  createdAt: 1,
  ...patch,
});
const saveRules = (store, list) => store({ [`rules:${HOST}`]: list });

test('a blur rule blurs its element on every visit', async ({ page, store }) => {
  await saveRules(store, [rule({ action: 'blur', selector: '#avatar', blur: 12 })]);
  await page.goto(PAGE);

  await expect(page.locator('#avatar')).toHaveCSS('filter', 'blur(12px)');
  await page.reload();
  await expect(page.locator('#avatar')).toHaveCSS('filter', 'blur(12px)');
});

test('hide rules either keep the space or remove the element from the layout', async ({ page, store }) => {
  await saveRules(store, [
    rule({ action: 'hide', selector: '#banner', hideMode: 'keep' }),
    rule({ action: 'hide', selector: '#notice', hideMode: 'collapse' }),
  ]);
  await page.goto(PAGE);

  await expect(page.locator('#banner')).toHaveCSS('visibility', 'hidden');
  await expect(page.locator('#banner')).not.toHaveCSS('display', 'none');
  await expect(page.locator('#notice')).toHaveCSS('display', 'none');
});

test('a text rule replaces the text, and deleting the rule restores it', async ({ page, store }) => {
  await saveRules(store, [rule({ action: 'text', selector: 'h1', tag: 'h1', text: 'My dashboard' })]);
  await page.goto(PAGE);
  await expect(page.locator('#title')).toHaveText('My dashboard');

  await saveRules(store, []);
  await expect(page.locator('#title')).toHaveText('Account overview');
});

test('a page rule applies only on its own page, and a site rule applies everywhere', async ({ page, store }) => {
  await saveRules(store, [
    rule({ action: 'hide', selector: '#banner', hideMode: 'collapse', scope: 'page' }),
    rule({ action: 'hide', selector: '#notice', hideMode: 'collapse', scope: 'site' }),
  ]);

  await page.goto(PAGE);
  await expect(page.locator('#banner')).toBeHidden();
  await expect(page.locator('#notice')).toBeHidden();

  await page.goto(OTHER);
  await expect(page.locator('#banner')).toBeVisible();
  await expect(page.locator('#notice')).toBeHidden();
});

test('a turned-off rule does nothing, and pausing Veil stops all rules', async ({ page, store }) => {
  await saveRules(store, [
    rule({ action: 'hide', selector: '#banner', hideMode: 'collapse', enabled: false }),
    rule({ action: 'hide', selector: '#notice', hideMode: 'collapse' }),
  ]);
  await page.goto(PAGE);
  await expect(page.locator('#banner')).toBeVisible();
  await expect(page.locator('#notice')).toBeHidden();

  await store({ paused: true });
  await expect(page.locator('#notice')).toBeVisible();
});

test('a rule whose selector stops matching finds its element by text', async ({ page, store }) => {
  await saveRules(store, [
    rule({ action: 'hide', selector: 'p.old-class', tag: 'p', fingerprint: 'Hello, Jane', hideMode: 'collapse' }),
  ]);
  await page.goto(PAGE);

  await expect(page.locator('p.greeting')).toBeHidden();
});
