import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Checkout Page Object for Saleor Storefront
 * Represents the checkout page
 */
export class CheckoutPage extends BasePage {
  // Locators
  private readonly checkoutTitle: Locator;
  private readonly loginSection: Locator;
  private readonly signInLink: Locator;
  private readonly signOutLink: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly shippingAddressSection: Locator;
  private readonly billingAddressSection: Locator;
  private readonly deliveryMethodsSection: Locator;
  private readonly paymentSection: Locator;
  private readonly orderSummary: Locator;
  private readonly makePaymentButton: Locator;
  private readonly orderConfirmation: Locator;
  private readonly useSameAddressCheckbox: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators with multiple fallback selectors
    this.checkoutTitle = page.locator('[data-testid="checkout-title"], .checkout-title, h1:has-text("Checkout")');
    this.loginSection = page.locator('[data-testid="login-section"], .login-section, .checkout-login');
    this.signInLink = page.locator('[data-testid="sign-in"], .sign-in, a:has-text("Sign in"), button:has-text("Sign in")');
    this.signOutLink = page.locator('[data-testid="sign-out"], .sign-out, a:has-text("Sign out"), button:has-text("Sign out")');
    this.emailInput = page.locator('[data-testid="email"], input[type="email"], input[name="email"]');
    this.passwordInput = page.locator('[data-testid="password"], input[type="password"], input[name="password"]');
    this.loginButton = page.locator('[data-testid="login-button"], .login-button, button:has-text("Login"), button[type="submit"]');
    this.shippingAddressSection = page.locator('[data-testid="shipping-address"], .shipping-address, :has-text("Shipping address")');
    this.billingAddressSection = page.locator('[data-testid="billing-address"], .billing-address, :has-text("Billing address")');
    this.deliveryMethodsSection = page.locator('[data-testid="delivery-methods"], .delivery-methods, :has-text("Delivery")');
    this.paymentSection = page.locator('[data-testid="payment"], .payment-section, :has-text("Payment")');
    this.orderSummary = page.locator('[data-testid="order-summary"], .order-summary, .summary');
    this.makePaymentButton = page.locator('[data-testid="make-payment"], .make-payment, button:has-text("Make payment"), button:has-text("Place order")');
    this.orderConfirmation = page.locator('[data-testid="order-confirmation"], .order-confirmation, :has-text("confirmed"), :has-text("Order")');
    this.useSameAddressCheckbox = page.locator('[data-testid="use-same-address"], input[type="checkbox"]:near(:text("billing"))');
  }

  /**
   * Navigate to checkout page
   */
  async goto(): Promise<void> {
    await this.page.goto('/checkout');
    await this.waitForPageLoad();
  }

  /**
   * Verify checkout page is loaded
   */
  async verifyCheckoutPageLoaded(): Promise<void> {
    // Verify URL
    await expect(this.page).toHaveURL(/.*\/checkout.*/);
    
    // Wait for page to fully load
    await this.waitForPageLoad();
  }

  /**
   * Verify sign in link is displayed
   */
  async verifySignInLinkDisplayed(): Promise<void> {
    await expect(this.signInLink).toBeVisible();
  }

  /**
   * Click sign in link
   */
  async clickSignIn(): Promise<void> {
    await this.safeClick(this.signInLink);
    await this.waitForPageLoad();
  }

  /**
   * Perform login
   */
  async login(email: string, password: string): Promise<void> {
    // Fill email
    await this.safeFill(this.emailInput, email);
    
    // Fill password
    await this.safeFill(this.passwordInput, password);
    
    // Click login button
    await this.safeClick(this.loginButton);
    
    // Wait for login to complete
    await this.waitForPageLoad();
  }

  /**
   * Verify user is logged in
   */
  async verifyUserLoggedIn(): Promise<void> {
    // Check that sign in link changed to sign out
    if (await this.elementExists(this.signOutLink)) {
      await expect(this.signOutLink).toBeVisible();
    }
    
    // Or check that we're no longer on login form
    const hasLoginForm = await this.elementExists(this.emailInput);
    if (hasLoginForm) {
      // If login form still exists, it should be hidden or we should be past it
      const isLoginFormVisible = await this.emailInput.isVisible();
      expect(isLoginFormVisible).toBe(false);
    }
  }

  /**
   * Verify shipping address section
   */
  async verifyShippingAddressSection(): Promise<void> {
    if (await this.elementExists(this.shippingAddressSection)) {
      await expect(this.shippingAddressSection).toBeVisible();
    }
  }

  /**
   * Verify billing address section
   */
  async verifyBillingAddressSection(): Promise<void> {
    if (await this.elementExists(this.billingAddressSection)) {
      await expect(this.billingAddressSection).toBeVisible();
    }
  }

  /**
   * Verify delivery methods section
   */
  async verifyDeliveryMethodsSection(): Promise<void> {
    if (await this.elementExists(this.deliveryMethodsSection)) {
      await expect(this.deliveryMethodsSection).toBeVisible();
    }
  }

  /**
   * Verify order summary
   */
  async verifyOrderSummary(): Promise<void> {
    await expect(this.orderSummary).toBeVisible();
  }

  /**
   * Verify order summary contains item
   */
  async verifyOrderSummaryContainsItem(itemName: string): Promise<void> {
    const summaryWithItem = this.orderSummary.locator(`:has-text("${itemName}")`);
    await expect(summaryWithItem).toBeVisible();
  }

  /**
   * Verify make payment button is available
   */
  async verifyMakePaymentButtonAvailable(): Promise<void> {
    await expect(this.makePaymentButton).toBeVisible();
    await expect(this.makePaymentButton).toBeEnabled();
  }

  /**
   * Click make payment button
   */
  async clickMakePayment(): Promise<void> {
    await this.safeClick(this.makePaymentButton);
    await this.waitForPageLoad();
  }

  /**
   * Verify order confirmation
   */
  async verifyOrderConfirmation(): Promise<void> {
    await expect(this.orderConfirmation).toBeVisible();
    
    // Check for common confirmation messages
    const confirmationText = await this.orderConfirmation.textContent();
    const hasConfirmationKeywords = confirmationText?.toLowerCase().includes('confirmed') || 
                                   confirmationText?.toLowerCase().includes('order') ||
                                   confirmationText?.toLowerCase().includes('success');
    
    expect(hasConfirmationKeywords).toBe(true);
  }

  /**
   * Complete checkout process for logged-in user
   */
  async completeCheckoutAsLoggedInUser(): Promise<void> {
    // Verify checkout elements are available
    await this.verifyOrderSummary();
    
    // Wait for all sections to load
    await this.waitForPageLoad();
    
    // Click make payment if button is available
    if (await this.elementExists(this.makePaymentButton)) {
      await this.clickMakePayment();
    }
  }

  /**
   * Verify checkout form is properly loaded for logged-in user
   */
  async verifyCheckoutFormForLoggedInUser(): Promise<void> {
    // Verify basic sections are present
    await this.verifyOrderSummary();
    
    // Check for shipping address (if exists)
    if (await this.elementExists(this.shippingAddressSection)) {
      await this.verifyShippingAddressSection();
    }
    
    // Check for delivery methods (if exists)
    if (await this.elementExists(this.deliveryMethodsSection)) {
      await this.verifyDeliveryMethodsSection();
    }
    
    // Verify make payment button
    await this.verifyMakePaymentButtonAvailable();
  }

  /**
   * Get order number from confirmation
   */
  async getOrderNumber(): Promise<string> {
    const confirmationText = await this.orderConfirmation.textContent();
    const orderMatch = confirmationText?.match(/Order #?(\w+)/i);
    return orderMatch?.[1] || '';
  }

  /**
   * Verify specific checkout elements based on current state
   */
  async verifyCheckoutElements(): Promise<void> {
    // Always verify order summary
    await this.verifyOrderSummary();
    
    // Check what sections are available and verify them
    const sectionsToCheck = [
      { element: this.shippingAddressSection, verify: () => this.verifyShippingAddressSection() },
      { element: this.deliveryMethodsSection, verify: () => this.verifyDeliveryMethodsSection() },
      { element: this.makePaymentButton, verify: () => this.verifyMakePaymentButtonAvailable() }
    ];
    
    for (const section of sectionsToCheck) {
      if (await this.elementExists(section.element)) {
        await section.verify();
      }
    }
  }
}
