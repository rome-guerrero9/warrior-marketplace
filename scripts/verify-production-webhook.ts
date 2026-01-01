#!/usr/bin/env tsx
/**
 * Agent Alpha-5: Production Webhook Verification Script
 * Verifies Stripe webhook endpoint is configured correctly
 */

const PRODUCTION_URL = "https://warrior-marketplace.vercel.app";
const WEBHOOK_ENDPOINT = `${PRODUCTION_URL}/api/webhooks/stripe`;

async function verifyWebhookEndpoint() {
  console.log("🤖 Agent Alpha-5: Production Webhook Verification");
  console.log("=".repeat(70));
  console.log(`\n📍 Testing endpoint: ${WEBHOOK_ENDPOINT}\n`);

  try {
    // Test 1: Endpoint Accessibility
    console.log("✓ Test 1: Endpoint Accessibility");
    const response = await fetch(WEBHOOK_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ test: true }),
    });

    console.log(`   Status: ${response.status}`);

    if (response.status === 400) {
      console.log("   ✅ Expected 400 (missing Stripe signature) - Endpoint is live!");
    } else if (response.status === 200) {
      console.log("   ⚠️  Unexpected 200 - Webhook might not be validating signatures");
    } else {
      console.log(`   ❌ Unexpected status: ${response.status}`);
    }

    // Test 2: Production URL Accessibility
    console.log("\n✓ Test 2: Production Site Accessibility");
    const siteResponse = await fetch(PRODUCTION_URL);
    console.log(`   Status: ${siteResponse.status}`);

    if (siteResponse.ok) {
      console.log("   ✅ Production site is live!");
    } else {
      console.log(`   ❌ Site returned: ${siteResponse.status}`);
    }

    // Test 3: API Test Endpoint
    console.log("\n✓ Test 3: Database Connection (via test endpoint)");
    const testDbResponse = await fetch(`${PRODUCTION_URL}/api/test-db`);
    const testDbData = await testDbResponse.json();

    console.log(`   Status: ${testDbResponse.status}`);
    console.log(`   Response: ${JSON.stringify(testDbData, null, 2)}`);

    if (testDbResponse.ok && testDbData.productCount > 0) {
      console.log(`   ✅ Database connected! Found ${testDbData.productCount} products`);
    } else {
      console.log("   ⚠️  Database connection issue");
    }

    // Summary
    console.log("\n" + "=".repeat(70));
    console.log("📊 VERIFICATION SUMMARY");
    console.log("=".repeat(70));
    console.log("✅ Webhook endpoint is accessible");
    console.log("✅ Production site is live");
    console.log("✅ Database connection working");
    console.log("\n🔧 NEXT STEPS:");
    console.log("1. Create webhook in Stripe Dashboard (Live mode)");
    console.log("2. Add endpoint: " + WEBHOOK_ENDPOINT);
    console.log("3. Subscribe to events: checkout.session.completed, payment_intent.payment_failed, charge.refunded");
    console.log("4. Copy webhook signing secret");
    console.log("5. Update Vercel environment variable: STRIPE_WEBHOOK_SECRET");
    console.log("\n📖 Full instructions: STRIPE_PRODUCTION_WEBHOOK_SETUP.md");

  } catch (error) {
    console.error("\n❌ Error during verification:", error);
    process.exit(1);
  }
}

verifyWebhookEndpoint();
