import { defineConfig, devices } from '@playwright/test'

const PORT = 4173

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    // PLAYWRIGHT_CHANNEL=chrome runs the tests in an installed Chrome instead of Playwright's Chromium.
    channel: process.env.PLAYWRIGHT_CHANNEL,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    // The assignment asks for a usable layout from 360 px wide.
    { name: 'mobile', use: { ...devices['Pixel 5'], viewport: { width: 360, height: 740 } } },
  ],
  // Test the production build, so the lazy-loaded chunks are the ones that really ship.
  webServer: {
    command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
