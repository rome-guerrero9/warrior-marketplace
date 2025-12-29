#!/bin/bash
# =====================================================
# STRIPE WEBHOOK SETUP SCRIPT
# =====================================================
# Run this script to set up Stripe webhooks for local development
# Prerequisites: npm installed, Stripe CLI installed

set -e

echo "🚀 Warrior Marketplace - Stripe Webhook Setup"
echo "=============================================="
echo ""

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI not found. Installing..."
    
    # Download and install Stripe CLI
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        wget -q https://github.com/stripe/stripe-cli/releases/download/v1.19.5/stripe_1.19.5_linux_x86_64.tar.gz
        tar -xzf stripe_1.19.5_linux_x86_64.tar.gz
        sudo mv stripe /usr/local/bin/
        rm stripe_1.19.5_linux_x86_64.tar.gz
        echo "✅ Stripe CLI installed"
    else
        echo "Please install Stripe CLI manually: https://stripe.com/docs/stripe-cli"
        exit 1
    fi
fi

echo ""
echo "Step 1: Log into Stripe"
echo "-----------------------"
echo "This will open a browser window for authentication."
echo ""
stripe login

echo ""
echo "Step 2: Starting Webhook Listener"
echo "----------------------------------"
echo "Forwarding webhooks to: http://localhost:3000/api/webhooks/stripe"
echo ""
echo "⚠️  IMPORTANT: Copy the webhook signing secret (whsec_...) that appears below"
echo "and update your .env.local file:"
echo ""
echo "    STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxx"
echo ""
echo "Press Ctrl+C to stop the webhook listener when done testing."
echo ""

# Start webhook forwarding
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
