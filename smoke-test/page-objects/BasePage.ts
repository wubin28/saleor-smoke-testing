import { Page, Locator, expect } from '@playwright/test';

/**
 * Base Page Object containing common functionality
 * Follows 2025 best practices for Page Object Model
 */
export abstract class BasePage {
  public readonly page: Page;
  
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to the page
   */
  abstract goto(): Promise<void>;

  /**
   * Wait for page to be loaded - optimized for speed
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    // Skip network idle for faster execution
  }

  /**
   * Take screenshot for debugging
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }

  /**
   * Wait for element to be visible - optimized timeout
   */
  async waitForElement(locator: Locator, timeout = 5000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Safe click with wait
   */
  async safeClick(locator: Locator): Promise<void> {
    await this.waitForElement(locator);
    await locator.click();
  }

  /**
   * Safe fill with wait
   */
  async safeFill(locator: Locator, text: string): Promise<void> {
    await this.waitForElement(locator);
    await locator.fill(text);
  }

  /**
   * Check if element exists - faster timeout
   */
  async elementExists(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'attached', timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Verify page is loaded by checking URL pattern
   */
  async verifyPageLoaded(urlPattern: RegExp): Promise<void> {
    await expect(this.page).toHaveURL(urlPattern);
  }
}
