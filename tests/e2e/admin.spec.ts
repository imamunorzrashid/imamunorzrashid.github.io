import { test, expect } from '@playwright/test';

// The CMS is for development only, so the production build must not serve it.
test('/admin/ is not served by the production build', async ({ request }) => {
  const res = await request.get('/admin/');
  expect(res.status()).not.toBe(200);
});
