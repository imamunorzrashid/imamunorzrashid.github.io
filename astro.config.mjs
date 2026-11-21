import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://mamunorrashid.me',
  trailingSlash: 'always',
  // Old pages merged into About. Sent emails may still link to them.
  redirects: {
    '/academics/': '/about/#education',
    '/experience/': '/about/#work',
    '/achievements/': '/about/#recognition',
  },
});
