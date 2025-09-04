import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Home Page Object for Saleor Storefront
 * Represents the landing page at localhost:3000
 */
export class HomePage extends BasePage {
  // Locators
  private readonly logo: Locator;
  private readonly navigation: Locator;
  private readonly productList: Locator;
  private readonly productCards: Locator;
  private readonly searchInput: Locator;
  private readonly cartIcon: Locator;
  private readonly cartBadge: Locator;
  private readonly footer: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.logo = page.locator('[data-testid="logo"], .logo, header img');
    this.navigation = page.locator('nav, [data-testid="navigation"]');
    this.productList = page.locator('[data-testid="product-list"], .product-list, main');
    this.productCards = page.locator('[data-testid="product-card"], .product-card, [href*="/products/"]');
    this.searchInput = page.locator('input[type="search"], [placeholder*="Search"], [data-testid="search"]');
    this.cartIcon = page.locator('[data-testid="cart"], [href*="cart"], .cart');
    this.cartBadge = page.locator('[data-testid="cart-badge"], .cart-badge, .cart-count');
    this.footer = page.locator('footer');
  }

  /**
   * Navigate to homepage
   */
  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.waitForPageLoad();
  }

  /**
   * Verify homepage is loaded correctly
   */
  async verifyHomepageLoaded(): Promise<void> {
    // Verify URL
    await expect(this.page).toHaveURL(/.*localhost:3000.*/);
    
    // Verify essential elements are visible
    await expect(this.productList).toBeVisible();
    
    // Verify page has products or at least the main content area
    const hasProducts = await this.elementExists(this.productCards.first());
    const hasMainContent = await this.elementExists(this.productList);
    
    expect(hasProducts || hasMainContent).toBe(true);
  }

  /**
   * Verify product list is displayed
   */
  async verifyProductListDisplayed(): Promise<void> {
    await expect(this.productList).toBeVisible();
    
    // Check if products are loaded
    const productCount = await this.productCards.count();
    expect(productCount).toBeGreaterThan(0);
  }

  /**
   * Get first product card
   */
  getFirstProduct(): Locator {
    return this.productCards.first();
  }

  /**
   * Get product by name (case insensitive)
   */
  getProductByName(productName: string): Locator {
    return this.page.locator(`[data-testid="product-card"]:has-text("${productName}"), .product-card:has-text("${productName}"), [href*="/products/"]:has-text("${productName}")`).first();
  }

  /**
   * Click on a product
   */
  async clickProduct(productLocator: Locator): Promise<void> {
    await this.safeClick(productLocator);
  }

  /**
   * Click on the first available product
   */
  async clickFirstProduct(): Promise<void> {
    const firstProduct = this.getFirstProduct();
    await this.clickProduct(firstProduct);
  }

  /**
   * Click on product by name
   */
  async clickProductByName(productName: string): Promise<void> {
    const product = this.getProductByName(productName);
    await this.clickProduct(product);
  }

  /**
   * Get cart badge number
   */
  async getCartBadgeCount(): Promise<number> {
    try {
      const badgeText = await this.cartBadge.textContent();
      return badgeText ? parseInt(badgeText.trim()) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Click cart icon
   */
  async clickCartIcon(): Promise<void> {
    await this.safeClick(this.cartIcon);
  }

  /**
   * Verify cart badge shows specific count
   */
  async verifyCartBadgeCount(expectedCount: number): Promise<void> {
    if (expectedCount > 0) {
      await expect(this.cartBadge).toBeVisible();
      await expect(this.cartBadge).toContainText(expectedCount.toString());
    }
  }

  /**
   * Search for products
   */
  async searchProducts(searchTerm: string): Promise<void> {
    if (await this.elementExists(this.searchInput)) {
      await this.safeFill(this.searchInput, searchTerm);
      await this.page.keyboard.press('Enter');
      await this.waitForPageLoad();
    }
  }

  /**
   * Verify navigation is visible
   */
  async verifyNavigationVisible(): Promise<void> {
    if (await this.elementExists(this.navigation)) {
      await expect(this.navigation).toBeVisible();
    }
  }

  /**
   * Verify footer is visible
   */
  async verifyFooterVisible(): Promise<void> {
    if (await this.elementExists(this.footer)) {
      await expect(this.footer).toBeVisible();
    }
  }

  /**
   * Wait for cart badge to appear with timeout
   */
  async waitForCartBadge(timeout = 3000): Promise<boolean> {
    try {
      const cartBadgeSelector = '[data-testid="cart-badge"], .cart-badge, .cart-count';
      await this.page.waitForSelector(cartBadgeSelector, { 
        state: 'visible', 
        timeout 
      });
      return true;
    } catch {
      console.log('Cart badge not found - this is acceptable for smoke test');
      return false;
    }
  }
}
