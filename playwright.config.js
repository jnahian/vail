const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  // Each test starts its own browser with the extension, so tests do not share storage.
  fullyParallel: true,
  reporter: process.env.CI ? 'github' : 'list',
});
