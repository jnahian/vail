const { test: base, expect, HOST, dataConfig, launchReloadable } = require('./fixtures');

// This file needs a browser that can reload Veil, so it does not use the shared context.
const test = base.extend({
  browserWithReload: async ({}, use) => {
    const b = await launchReloadable();
    await use(b);
    await b.close();
  },
});

const store = (worker, items) => worker.evaluate((i) => chrome.storage.local.set(i), items);

test('after Veil is reloaded, an open tab still follows configuration changes', async ({ browserWithReload }) => {
  const { context, veilWorker, reloadExtension } = browserWithReload;
  await store(await veilWorker(), dataConfig({ style: 'blur' }));
  const page = await context.newPage();
  await page.goto(`http://${HOST}/data.html`);
  await expect(page.locator('veil-money')).toHaveText(['$1,240.50']);

  // The tab keeps the old content script, which can no longer receive changes.
  const oldWorker = await veilWorker();
  await reloadExtension();
  await expect.poll(async () => (await veilWorker()) !== oldWorker).toBe(true);
  await store(await veilWorker(), dataConfig({ style: 'blur', enabled: false }));

  await expect(page.locator('veil-money')).toHaveCount(0);
  await expect(page.locator('#money')).toHaveText('Balance $1,240.50 due');

  await store(await veilWorker(), dataConfig({ style: 'blur' }));
  await expect(page.locator('veil-money')).toHaveText(['$1,240.50']);
});
