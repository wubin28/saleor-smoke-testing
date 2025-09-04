import { Page, expect } from '@playwright/test';

/**
 * Test helper utilities for Saleor smoke tests
 * Provides common functionality used across multiple test files
 */

export class TestHelpers {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Wait for network activity to settle
   */
  async waitForNetworkIdle(timeout = 10000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Take timestamped screenshot
   */
  async takeTimestampedScreenshot(name: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}-${timestamp}.png`,
      fullPage: true 
    });
  }

  /**
   * Check if element exists without throwing
   */
  async elementExists(selector: string, timeout = 5000): Promise<boolean> {
    try {
      await this.page.locator(selector).waitFor({ state: 'attached', timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Safe click with retry mechanism
   */
  async safeClick(selector: string, retries = 3): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        await this.page.locator(selector).waitFor({ state: 'visible' });
        await this.page.locator(selector).click();
        return;
      } catch (error) {
        if (i === retries - 1) throw error;
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Wait for page title to change
   */
  async waitForTitleChange(expectedTitle: string | RegExp, timeout = 10000): Promise<void> {
    await expect(this.page).toHaveTitle(expectedTitle, { timeout });
  }

  /**
   * Wait for URL to change
   */
  async waitForUrlChange(expectedUrl: string | RegExp, timeout = 10000): Promise<void> {
    await expect(this.page).toHaveURL(expectedUrl, { timeout });
  }

  /**
   * Get page performance metrics
   */
  async getPerformanceMetrics(): Promise<any> {
    return await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalTime: navigation.loadEventEnd - navigation.fetchStart
      };
    });
  }

  /**
   * Check console errors
   */
  async checkConsoleErrors(): Promise<string[]> {
    const errors: string[] = [];
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    return errors;
  }

  /**
   * Scroll to element
   */
  async scrollToElement(selector: string): Promise<void> {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  /**
   * Wait for specific text to appear
   */
  async waitForText(text: string, timeout = 10000): Promise<void> {
    await this.page.locator(`:has-text("${text}")`).waitFor({ timeout });
  }

  /**
   * Clear local storage
   */
  async clearLocalStorage(): Promise<void> {
    await this.page.evaluate(() => localStorage.clear());
  }

  /**
   * Clear session storage
   */
  async clearSessionStorage(): Promise<void> {
    await this.page.evaluate(() => sessionStorage.clear());
  }

  /**
   * Check if page is responsive
   */
  async checkResponsiveness(): Promise<boolean> {
    // Test mobile viewport
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.waitForTimeout(1000);
    
    // Check if page adapts to mobile
    const isMobileResponsive = await this.page.evaluate(() => {
      return window.innerWidth <= 768;
    });

    // Reset to desktop viewport
    await this.page.setViewportSize({ width: 1280, height: 720 });
    await this.page.waitForTimeout(1000);

    return isMobileResponsive;
  }
}

/**
 * Global test utilities
 */
export class GlobalTestUtils {
  /**
   * Generate random email for testing
   */
  static generateRandomEmail(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `test.${timestamp}.${random}@example.com`;
  }

  /**
   * Generate random string
   */
  static generateRandomString(length = 8): string {
    return Math.random().toString(36).substring(2, length + 2);
  }

  /**
   * Format currency for comparison
   */
  static formatCurrency(amount: string): string {
    return amount.replace(/[^\d.,]/g, '').trim();
  }

  /**
   * Wait for specified duration
   */
  static async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry function with exponential backoff
   */
  static async retry<T>(
    fn: () => Promise<T>, 
    maxRetries = 3, 
    baseDelay = 1000
  ): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        
        const delay = baseDelay * Math.pow(2, i);
        await this.wait(delay);
      }
    }
    throw new Error('Max retries exceeded');
  }
}

/**
 * Test data constants
 */
export const TEST_DATA = {
  DEFAULT_USER: {
    email: 'admin@example.com',
    password: 'admin'
  },
  
  SAMPLE_PRODUCTS: {
    MONOSPACE_TEE: 'Monospace Tee',
    DEFAULT_SIZE: 'S',
    DEFAULT_QUANTITY: 1
  },
  
  TIMEOUTS: {
    SHORT: 5000,
    MEDIUM: 10000,
    LONG: 30000,
    EXTRA_LONG: 60000
  },
  
  VIEWPORT: {
    DESKTOP: { width: 1280, height: 720 },
    TABLET: { width: 768, height: 1024 },
    MOBILE: { width: 375, height: 667 }
  }
} as const;
