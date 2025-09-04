# Saleor E-commerce Platform Smoke Tests

This directory contains smoke tests for the Saleor e-commerce platform using **Playwright + TypeScript + Jest** technology stack, following 2025 software testing best practices.

## 🎯 Test Scope

The smoke tests verify the fundamental e-commerce functionality based on the test scenarios defined in `../start_saleor/live-practical-demo/04-test-scenario-design/04-test-scenario-design.md`.

### Test Coverage

**System Basic Functionality Verification (Web UI Stack):**
- ✅ Homepage loads with product listings
- ✅ Product detail pages display correctly
- ✅ Add to cart functionality works
- ✅ Shopping cart displays added items
- ✅ Checkout page is accessible
- ✅ Complete user journey flow

## 🏗️ Architecture

### Technology Stack
- **Test Framework**: Playwright v1.48.0
- **Language**: TypeScript 5.6.3
- **Test Runner**: Playwright Test Runner
- **Design Pattern**: Page Object Model (POM)
- **Reporting**: HTML, JSON, JUnit reports

### Project Structure
```
testing/
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── playwright.config.ts        # Playwright configuration
├── README.md                   # This file
└── smoke-test/
    ├── page-objects/           # Page Object Model classes
    │   ├── BasePage.ts         # Base page with common functionality
    │   ├── HomePage.ts         # Homepage interactions
    │   ├── ProductPage.ts      # Product detail page
    │   ├── CartPage.ts         # Shopping cart page
    │   └── CheckoutPage.ts     # Checkout page
    ├── utils/
    │   └── test-helpers.ts     # Utility functions and test data
    └── system-basics.smoke.spec.ts  # Main smoke test suite
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Saleor storefront running on `localhost:3000`
- macOS with iTerm2 (recommended)

### Installation

1. **Navigate to testing directory:**
   ```bash
   cd /Users/binwu/OOR-local/katas/saleor/testing
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install Playwright browsers:**
   ```bash
   npm run test:install
   ```

### Running Tests

#### Basic Test Execution
```bash
# Run all smoke tests
npm test

# Run only smoke tests
npm run test:smoke

# Run tests in headed mode (visible browser)
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Launch Playwright UI mode
npm run test:ui
```

#### Advanced Options
```bash
# Run specific test file
npx playwright test system-basics.smoke.spec.ts

# Run tests in specific browser
npx playwright test --project="Desktop Chrome"

# Run tests with specific timeout
npx playwright test --timeout=60000

# Generate and view HTML report
npm run test:report
```

### Test Reports

After running tests, reports are generated in:
- `playwright-report/` - HTML report (interactive)
- `test-results/` - JSON and JUnit reports
- `test-results/screenshots/` - Failure screenshots

## 🔧 Configuration

### Environment Variables
- `BASE_URL` - Base URL for testing (default: http://localhost:3000)
- `CI` - Set to true for CI/CD environments

### Browser Configuration
Tests run on multiple browsers by default:
- Desktop Chrome (primary)
- Desktop Firefox
- Desktop Safari
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

### Timeouts
- Global test timeout: 60 seconds
- Action timeout: 10 seconds
- Navigation timeout: 30 seconds
- Expect timeout: 10 seconds

## 📝 Writing Tests

### Page Object Model Example
```typescript
import { test } from '@playwright/test';
import { HomePage } from './page-objects/HomePage';

test('Homepage loads correctly', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  await homePage.verifyHomepageLoaded();
});
```

### Best Practices
1. **Use Page Objects** - Encapsulate page interactions in page object classes
2. **Meaningful Assertions** - Use descriptive expect statements
3. **Error Handling** - Include proper error handling and retries
4. **Screenshots** - Take screenshots on failures for debugging
5. **Test Isolation** - Each test should be independent
6. **Descriptive Names** - Use clear, descriptive test names

## 🐛 Troubleshooting

### Common Issues

1. **Saleor not running:**
   ```bash
   # Ensure Saleor storefront is running on localhost:3000
   cd ../storefront/saleor-storefront-installed-manually-from-fork
   npm run dev
   ```

2. **Browser installation issues:**
   ```bash
   # Reinstall Playwright browsers
   npx playwright install --force
   ```

3. **TypeScript errors:**
   ```bash
   # Check TypeScript compilation
   npm run type-check
   ```

4. **Port conflicts:**
   - Ensure port 3000 is not occupied by other services
   - Update `BASE_URL` environment variable if needed

### Debug Mode
```bash
# Run single test in debug mode
npx playwright test system-basics.smoke.spec.ts --debug

# Run with verbose logging
npx playwright test --verbose
```

## 📊 Test Metrics

### Performance Targets
- Page load time: < 5 seconds
- Test execution time: < 60 seconds per test
- Success rate: > 95%

### Coverage Metrics
- Critical user paths: 100%
- Essential UI elements: 100%
- Core e-commerce functions: 100%

## 🤝 Contributing

1. Follow existing code patterns and naming conventions
2. Add proper JSDoc comments for new functions
3. Include error handling and retries for flaky operations
4. Update this README when adding new features
5. Ensure all tests pass before committing

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Saleor Documentation](https://docs.saleor.io/)

## 📞 Support

For issues or questions:
1. Check existing test reports in `playwright-report/`
2. Review console logs and screenshots
3. Consult Saleor documentation
4. Contact the QA team

---

**Last Updated**: 2025-01-01
**Version**: 1.0.0
**Maintainer**: Saleor QA Team