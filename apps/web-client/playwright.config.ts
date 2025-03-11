/* eslint-disable node/no-process-env */
import { defineConfig, devices } from "@playwright/test";

const baseURL
  = process.env.PLAYWRIGHT_TEST_BASE_URL || "http://app.fatturex.io";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  use: {
    baseURL,
    headless: true,
    extraHTTPHeaders: {
      "x-vercel-skip-toolbar": "1",
    },
  },
  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Use prepared auth state.
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },

    // {
    //   name: 'firefox',
    //   use: {
    //     ...devices['Desktop Firefox'],
    //     // Use prepared auth state.
    //     storageState: 'playwright/.auth/user.json',
    //   },
    //   dependencies: ['setup'],
    // },
  ],
});
