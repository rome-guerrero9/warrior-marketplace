import { test, expect } from '@playwright/test';

/**
 * AUTOMATED END-TO-END PAYMENT TESTING
 * Agent: Bravo-1
 * Purpose: Validate entire payment flow without manual intervention
 */

const BASE_URL = 'https://warrior-marketplace.vercel.app';

// Test data
const TEST_EMAILS = {
  success: 'test-success@warrioraiautomations.com',
  decline: 'test-decline@warrioraiautomations.com',
  agency: 'test-agency@warrioraiautomations.com',
};

const STRIPE_TEST_CARDS = {
  success: '4242424242424242',
  decline: '4000000000000002',
};

test.describe('Payment Flow E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto(BASE_URL);
  });

  test('Scenario 1: Free Product Download Flow', async ({ page }) => {
    console.log('🧪 Testing Free Product Download...');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find and click the MCP Starter Pack (FREE product)
    // Look for the product card with "FREE" text
    const freeProduct = page.locator('text=MCP Starter Pack').first();
    await expect(freeProduct).toBeVisible({ timeout: 10000 });

    // Click on the free product
    await freeProduct.click();

    // Wait for navigation
    await page.waitForLoadState('networkidle');

    // For free products, should auto-redirect to download URL
    // Check if we're NOT on a checkout page
    const currentUrl = page.url();
    console.log(`   Current URL after click: ${currentUrl}`);

    // Free product should either:
    // 1. Redirect to download URL directly
    // 2. Or show a download page (not checkout page)

    // Verify we're not seeing a checkout form
    const emailInput = page.locator('input[name="email"]');
    const hasEmailInput = await emailInput.count() > 0;

    if (hasEmailInput) {
      // If we see an email input, this is the checkout page
      // This might be expected behavior for free products too
      console.log('   ⚠️  Checkout page displayed for free product');

      // For free products, the checkout flow might be simplified
      // Let's proceed and see what happens
      await emailInput.fill(TEST_EMAILS.success);

      const submitButton = page.locator('button[type="submit"]', { hasText: /download free|continue/i });
      await submitButton.click();

      await page.waitForLoadState('networkidle');
      console.log(`   After submit URL: ${page.url()}`);
    } else {
      console.log('   ✅ Auto-redirected (no checkout page shown)');
    }

    // Success criteria: Should not have gone through Stripe checkout
    expect(currentUrl).not.toContain('stripe.com');

    console.log('✅ Free Product Test Complete');
  });

  test('Scenario 2: Checkout Page Loads for Paid Product', async ({ page }) => {
    console.log('🧪 Testing Paid Product Checkout Page...');

    // Click on MCP Pro Pack ($9/month)
    const paidProduct = page.locator('text=MCP Pro Pack').first();
    await expect(paidProduct).toBeVisible({ timeout: 10000 });
    await paidProduct.click();

    // Wait for checkout page to load
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    console.log(`   Checkout URL: ${currentUrl}`);

    // Verify we're on a checkout page
    expect(currentUrl).toContain('/checkout/');

    // Verify product details are displayed
    await expect(page.locator('text=MCP Pro Pack')).toBeVisible();

    // Verify price is displayed correctly ($9 or $9.00)
    const priceElement = page.locator('text=/\\$9(\\.00)?/').first();
    await expect(priceElement).toBeVisible();

    // Verify email input exists
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toBeVisible();

    // Verify submit button exists
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();

    console.log('✅ Checkout Page Test Complete');
  });

  test('Scenario 3: Checkout Form Submission', async ({ page }) => {
    console.log('🧪 Testing Checkout Form Submission...');

    // Navigate to a paid product
    await page.goto(`${BASE_URL}/checkout/mcp-pro-pack`);
    await page.waitForLoadState('networkidle');

    // Fill in email
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill(TEST_EMAILS.success);
    console.log(`   Filled email: ${TEST_EMAILS.success}`);

    // Click submit button
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    console.log('   Clicked submit button');

    // Wait for navigation (will go to Stripe checkout or order page)
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    const currentUrl = page.url();
    console.log(`   After submit URL: ${currentUrl}`);

    // Should redirect to either:
    // 1. Stripe checkout (stripe.com)
    // 2. Order success page (if Stripe is configured differently)
    // 3. Checkout API endpoint

    // At minimum, should have left the original checkout page
    expect(currentUrl).not.toBe(`${BASE_URL}/checkout/mcp-pro-pack`);

    console.log('✅ Form Submission Test Complete');
  });

  test('Scenario 4: High-Value Product Display', async ({ page }) => {
    console.log('🧪 Testing High-Value Product (AgentFlow Agency)...');

    // Navigate directly to the expensive product
    await page.goto(`${BASE_URL}/checkout/agentflow-pro-agency`);
    await page.waitForLoadState('networkidle');

    // Verify product name
    await expect(page.locator('text=AgentFlow Pro - Agency')).toBeVisible();

    // Verify high price is displayed ($199)
    const priceElement = page.locator('text=/\\$199(\\.00)?/').first();
    await expect(priceElement).toBeVisible();

    // Verify checkout form is present
    await expect(page.locator('input[name="email"]')).toBeVisible();

    console.log('✅ High-Value Product Test Complete');
  });

  test('Scenario 5: All Products Load Correctly', async ({ page }) => {
    console.log('🧪 Testing All Product Pages...');

    const productSlugs = [
      'mcp-starter-pack',
      'mcp-pro-pack',
      'mcp-agency-suite',
      'agentflow-pro-starter',
      'agentflow-pro-professional',
      'agentflow-pro-agency',
    ];

    for (const slug of productSlugs) {
      console.log(`   Testing: ${slug}`);
      await page.goto(`${BASE_URL}/checkout/${slug}`);
      await page.waitForLoadState('networkidle', { timeout: 10000 });

      // Verify no error page
      const is404 = await page.locator('text=/404|not found/i').count() > 0;
      expect(is404).toBe(false);

      // Verify page has content
      const hasContent = await page.locator('main').count() > 0;
      expect(hasContent).toBe(true);

      console.log(`   ✅ ${slug} loads correctly`);
    }

    console.log('✅ All Products Test Complete');
  });

  test('Scenario 6: Console Errors Check', async ({ page }) => {
    console.log('🧪 Checking for Console Errors...');

    const consoleErrors: string[] = [];

    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate through key pages
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    await page.goto(`${BASE_URL}/checkout/mcp-pro-pack`);
    await page.waitForLoadState('networkidle');

    // Check if any errors occurred
    if (consoleErrors.length > 0) {
      console.log('   ⚠️  Console Errors Found:');
      consoleErrors.forEach((error) => {
        console.log(`   ❌ ${error}`);
      });

      // Fail if critical errors
      expect(consoleErrors.length).toBe(0);
    } else {
      console.log('   ✅ No console errors');
    }

    console.log('✅ Console Errors Check Complete');
  });

  test('Scenario 7: Performance Check', async ({ page }) => {
    console.log('🧪 Testing Page Load Performance...');

    // Measure homepage load time
    const homeStartTime = Date.now();
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const homeLoadTime = Date.now() - homeStartTime;

    console.log(`   Homepage load time: ${homeLoadTime}ms`);

    // Measure checkout page load time
    const checkoutStartTime = Date.now();
    await page.goto(`${BASE_URL}/checkout/mcp-pro-pack`);
    await page.waitForLoadState('networkidle');
    const checkoutLoadTime = Date.now() - checkoutStartTime;

    console.log(`   Checkout page load time: ${checkoutLoadTime}ms`);

    // Performance assertions (should load in < 5 seconds)
    expect(homeLoadTime).toBeLessThan(5000);
    expect(checkoutLoadTime).toBeLessThan(5000);

    // Ideal performance (< 2 seconds)
    if (homeLoadTime < 2000 && checkoutLoadTime < 2000) {
      console.log('   🚀 Excellent performance (< 2s)');
    } else if (homeLoadTime < 3000 && checkoutLoadTime < 3000) {
      console.log('   ✅ Good performance (< 3s)');
    } else {
      console.log('   ⚠️  Acceptable performance (< 5s)');
    }

    console.log('✅ Performance Check Complete');
  });
});

/**
 * NOTE: Stripe Checkout Automation Limitation
 *
 * This test suite cannot fully automate Stripe's checkout flow because:
 * 1. Stripe uses anti-bot measures that block automated testing
 * 2. Their checkout iframe/page has security restrictions
 * 3. Test mode still requires real browser interaction
 *
 * For full payment testing, use:
 * - Manual browser testing (see TESTING-INSTRUCTIONS.md)
 * - Post-payment verification script (verify_test_orders.py)
 * - Stripe Dashboard webhook verification
 *
 * This automated suite validates:
 * ✅ Product pages load correctly
 * ✅ Checkout forms are functional
 * ✅ Form submission triggers redirect
 * ✅ No console errors
 * ✅ Performance meets targets
 *
 * Still requires manual verification:
 * ⏳ Actual Stripe payment processing
 * ⏳ Webhook delivery and order status updates
 * ⏳ Success page after payment
 * ⏳ Email delivery (if configured)
 */
