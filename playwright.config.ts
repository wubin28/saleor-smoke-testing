import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Saleor smoke tests
 * Following 2025 best practices for e-commerce testing
 */
export default defineConfig({
  // Test directory
  testDir: './smoke-test',
  
  // Run tests in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // No retries for fast smoke tests
  retries: 0,
  
  // Use single worker for faster execution in smoke tests
  workers: 1,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    process.env.CI ? ['github'] : ['list']
  ],
  
  // Global test configuration
  use: {
    // Base URL for tests - Saleor storefront
    baseURL: 'http://localhost:3000',
    
    // Minimal tracing for speed
    trace: 'off',
    screenshot: 'only-on-failure',
    video: 'off',
    
    // Viewport
    viewport: { width: 1280, height: 720 },
    
    // User agent
    userAgent: 'Saleor-SmokeTest-Bot/1.0',
    
    // Faster timeouts for smoke tests
    actionTimeout: 5000,
    navigationTimeout: 15000,
    
    // Ignore HTTPS errors for local development
    ignoreHTTPSErrors: true,
  },

  // Faster test timeout
  timeout: 30000,
  
  // Faster expect timeout for assertions
  expect: {
    timeout: 5000,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'Desktop Chrome',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome'
      },
    },
    
    // {
    //   name: 'Desktop Firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    
    // {
    //   name: 'Desktop Safari',
    //   use: { ...devices['Desktop Safari'] },
    // },
    
    // Mobile testing
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'echo "Please ensure Saleor storefront is running on localhost:3000"',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  
  // Output directories
  outputDir: 'test-results/',
  
  // Global setup and teardown - remove to fix TypeScript error
});
