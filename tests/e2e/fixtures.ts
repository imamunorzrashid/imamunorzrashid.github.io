import { test as base } from '@playwright/test';

// Every e2e spec imports `test` from here so the live Flag Counter never loads during tests.
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route('**/*flagcounter.com/**', (route) => route.abort());
    await use(page);
  },
});

export { expect } from '@playwright/test';
export type { Page } from '@playwright/test';
