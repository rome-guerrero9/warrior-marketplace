#!/usr/bin/env python3
"""
Verify Test Orders in Database
Run after manual payment testing to confirm orders were created correctly
"""

import os
import requests
from datetime import datetime, timedelta

# Supabase configuration
SUPABASE_URL = "https://nzhtavvgjuvznpalqaox.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56aHRhdnZnanV2em5wYWxxYW94Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTUxNzgzMiwiZXhwIjoyMDUxMDkzODMyfQ.MfIrN_HWMHt6-J-NxlKzLGlMklSgV9A7Fp1qxjb8kJg")

# Test email addresses used in testing
TEST_EMAILS = [
    "test-success@warrioraiautomations.com",
    "test-decline@warrioraiautomations.com",
    "test-agency@warrioraiautomations.com",
    "test-duplicate@warrioraiautomations.com",
]

def get_orders_by_email(email: str) -> list:
    """Fetch orders for a specific email"""
    url = f"{SUPABASE_URL}/rest/v1/orders"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }
    params = {
        "customer_email": f"eq.{email}",
        "select": "*",
        "order": "created_at.desc"
    }

    response = requests.get(url, headers=headers, params=params)

    if response.status_code == 200:
        return response.json()
    else:
        print(f"❌ Error fetching orders for {email}: {response.status_code}")
        return []

def get_order_items(order_id: str) -> list:
    """Fetch order items for a specific order"""
    url = f"{SUPABASE_URL}/rest/v1/order_items"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }
    params = {
        "order_id": f"eq.{order_id}",
        "select": "*"
    }

    response = requests.get(url, headers=headers, params=params)

    if response.status_code == 200:
        return response.json()
    else:
        return []

def format_currency(cents: int) -> str:
    """Format cents to dollar string"""
    return f"${cents / 100:.2f}"

def print_order_summary(email: str, orders: list):
    """Print formatted order summary"""
    print(f"\n{'='*80}")
    print(f"📧 EMAIL: {email}")
    print(f"{'='*80}")

    if not orders:
        print("❌ No orders found")
        return

    for i, order in enumerate(orders, 1):
        print(f"\n📦 Order #{i}: {order['order_number']}")
        print(f"   ID: {order['id']}")
        print(f"   Status: {order['status'].upper()}")
        print(f"   Total: {format_currency(order['total_cents'])}")
        print(f"   Created: {order['created_at']}")

        if order.get('stripe_payment_intent_id'):
            print(f"   Stripe Payment Intent: {order['stripe_payment_intent_id']}")

        # Get order items
        items = get_order_items(order['id'])
        if items:
            print(f"   Items:")
            for item in items:
                print(f"      - {item.get('product_name', 'Unknown Product')}: {format_currency(item['price_cents'])}")

def verify_all_test_orders():
    """Verify all test orders"""
    print("\n" + "="*80)
    print("🧪 PAYMENT TESTING VERIFICATION")
    print("="*80)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    all_orders = []

    for email in TEST_EMAILS:
        orders = get_orders_by_email(email)
        all_orders.extend(orders)
        print_order_summary(email, orders)

    # Summary
    print("\n" + "="*80)
    print("📊 TEST SUMMARY")
    print("="*80)
    print(f"Total test orders found: {len(all_orders)}")

    # Group by status
    status_counts = {}
    for order in all_orders:
        status = order['status']
        status_counts[status] = status_counts.get(status, 0) + 1

    print("\nOrders by status:")
    for status, count in status_counts.items():
        emoji = "✅" if status == "paid" else "❌" if status == "failed" else "⏳"
        print(f"   {emoji} {status}: {count}")

    # Calculate total revenue from test orders
    total_revenue = sum(order['total_cents'] for order in all_orders if order['status'] == 'paid')
    print(f"\n💰 Total test revenue: {format_currency(total_revenue)}")

    print("\n" + "="*80)

if __name__ == "__main__":
    verify_all_test_orders()
