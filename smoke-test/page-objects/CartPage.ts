import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Cart Page Object for Saleor Storefront
 * Represents the shopping cart page
 */
export class CartPage extends BasePage {
  // Locators
  private readonly cartTitle: Locator;
  private readonly cartItems: Locator;
  private readonly cartItemName: Locator;
  private readonly cartItemPrice: Locator;
  private readonly cartItemQuantity: Locator;
  private readonly cartTotal: Locator;
  private readonly checkoutButton: Locator;
  private readonly continueShoppingButton: Locator;
  private readonly emptyCartMessage: Locator;
  private readonly removeItemButton: Locator;
  private readonly updateQuantityButton: Locator;
  private readonly cartSummary: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators with multiple fallback selectors
    this.cartTitle = page.locator('[data-testid="cart-title"], .cart-title, h1:has-text("Cart"), h1:has-text("Shopping")');
    this.cartItems = page.locator('[data-testid="cart-item"], .cart-item, .cart-line-item');
    this.cartItemName = page.locator('[data-testid="cart-item-name"], .cart-item-name, .item-name');
    this.cartItemPrice = page.locator('[data-testid="cart-item-price"], .cart-item-price, .item-price');
    this.cartItemQuantity = page.locator('[data-testid="cart-item-quantity"], .cart-item-quantity, .quantity input');
    this.cartTotal = page.locator('[data-testid="cart-total"], .cart-total, .total');
    this.checkoutButton = page.locator('[data-testid="checkout"], .checkout-button, button:has-text("Checkout")');
    this.continueShoppingButton = page.locator('[data-testid="continue-shopping"], .continue-shopping, button:has-text("Continue")');
    this.emptyCartMessage = page.locator('[data-testid="empty-cart"], .empty-cart, :has-text("empty"), :has-text("no items")');
    this.removeItemButton = page.locator('[data-testid="remove-item"], .remove-item, button:has-text("Remove")');
    this.updateQuantityButton = page.locator('[data-testid="update-quantity"], .update-quantity, button:has-text("Update")');
    this.cartSummary = page.locator('[data-testid="cart-summary"], .cart-summary, .summary');
  }

  /**
   * Navigate to cart page
   */
  async goto(): Promise<void> {
    await this.page.goto('/cart');
    await this.waitForPageLoad();
  }

  /**
   * Verify cart page is loaded
   */
  async verifyCartPageLoaded(): Promise<void> {
    // Verify URL
    await expect(this.page).toHaveURL(/.*\/cart.*/);
    
    // Wait for page content to load
    await this.waitForPageLoad();
  }

  /**
   * Verify cart contains items
   */
  async verifyCartHasItems(): Promise<void> {
    // Check that cart is not empty
    const isEmpty = await this.isCartEmpty();
    expect(isEmpty).toBe(false);
    
    // Verify cart items are visible
    await expect(this.cartItems.first()).toBeVisible();
  }

  /**
   * Verify specific item is in cart
   */
  async verifyItemInCart(itemName: string): Promise<void> {
    const itemLocator = this.page.locator(`[data-testid="cart-item"]:has-text("${itemName}"), .cart-item:has-text("${itemName}")`);
    await expect(itemLocator).toBeVisible();
  }

  /**
   * Get cart items count
   */
  async getCartItemsCount(): Promise<number> {
    try {
      return await this.cartItems.count();
    } catch {
      return 0;
    }
  }

  /**
   * Check if cart is empty
   */
  async isCartEmpty(): Promise<boolean> {
    // Check for empty cart message
    if (await this.elementExists(this.emptyCartMessage)) {
      return true;
    }
    
    // Check if no cart items exist
    const itemCount = await this.getCartItemsCount();
    return itemCount === 0;
  }

  /**
   * Get cart item names
   */
  async getCartItemNames(): Promise<string[]> {
    const items: string[] = [];
    const itemCount = await this.cartItems.count();
    
    for (let i = 0; i < itemCount; i++) {
      const item = this.cartItems.nth(i);
      const nameElement = item.locator('[data-testid="cart-item-name"], .cart-item-name, .item-name, h3, h4').first();
      
      if (await this.elementExists(nameElement)) {
        const name = await nameElement.textContent();
        if (name?.trim()) {
          items.push(name.trim());
        }
      }
    }
    
    return items;
  }

  /**
   * Get total price
   */
  async getTotalPrice(): Promise<string> {
    if (await this.elementExists(this.cartTotal)) {
      const total = await this.cartTotal.textContent();
      return total?.trim() || '';
    }
    return '';
  }

  /**
   * Click checkout button
   */
  async clickCheckout(): Promise<void> {
    await this.safeClick(this.checkoutButton);
  }

  /**
   * Verify checkout button is available
   */
  async verifyCheckoutButtonAvailable(): Promise<void> {
    await expect(this.checkoutButton).toBeVisible();
    await expect(this.checkoutButton).toBeEnabled();
  }

  /**
   * Continue shopping
   */
  async continueShopping(): Promise<void> {
    if (await this.elementExists(this.continueShoppingButton)) {
      await this.safeClick(this.continueShoppingButton);
    }
  }

  /**
   * Remove item from cart
   */
  async removeFirstItem(): Promise<void> {
    if (await this.elementExists(this.removeItemButton)) {
      await this.safeClick(this.removeItemButton.first());
      await this.waitForPageLoad();
    }
  }

  /**
   * Update item quantity
   */
  async updateItemQuantity(itemIndex: number, quantity: number): Promise<void> {
    const quantityInput = this.cartItemQuantity.nth(itemIndex);
    if (await this.elementExists(quantityInput)) {
      await this.safeFill(quantityInput, quantity.toString());
      
      // Click update button if it exists
      if (await this.elementExists(this.updateQuantityButton)) {
        await this.safeClick(this.updateQuantityButton);
        await this.waitForPageLoad();
      }
    }
  }

  /**
   * Verify cart displays correct item information
   */
  async verifyCartItemInformation(expectedItemName?: string): Promise<void> {
    // Verify cart has items
    await this.verifyCartHasItems();
    
    // If specific item name provided, verify it exists
    if (expectedItemName) {
      await this.verifyItemInCart(expectedItemName);
    }
    
    // Verify basic cart elements are visible
    const firstItem = this.cartItems.first();
    await expect(firstItem).toBeVisible();
  }

  /**
   * Verify cart summary information
   */
  async verifyCartSummary(): Promise<void> {
    // Check if cart summary exists and is visible
    if (await this.elementExists(this.cartSummary)) {
      await expect(this.cartSummary).toBeVisible();
    }
    
    // Verify checkout button is available for non-empty cart
    if (!await this.isCartEmpty()) {
      await this.verifyCheckoutButtonAvailable();
    }
  }
}
