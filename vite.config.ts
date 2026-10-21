import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        // Libraries change far less often than app code, so keep them in their own cached chunk.
        // Radix and lucide are not grouped: one shared chunk would preload the admin-only primitives
        // (accordion, dialog, checkbox) on every page instead of loading them with the admin routes.
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/,
            },
          ],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    // Playwright specs run with `npm run test:e2e`, not in Vitest.
    exclude: [...configDefaults.exclude, 'e2e/**'],
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
})
