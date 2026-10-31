import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:5174', channel: 'chrome', headless: true, trace: 'retain-on-failure' },
  // Isolate tests from local email credentials and any running user preview.
  webServer: {
    command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5174 --strictPort',
    url: 'http://127.0.0.1:5174', reuseExistingServer: false, timeout: 30000,
    env: { RESEND_API_KEY: '', NOTIFICATION_EMAIL: '', FROM_EMAIL: '', SITE_URL: '' },
  },
})
