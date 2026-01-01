#!/usr/bin/env python3
"""
Add Google Analytics Environment Variable to Vercel
"""

import requests
import os
import json

# Vercel configuration
VERCEL_TOKEN = os.getenv("VERCEL_TOKEN")
TEAM_ID = "team_BxKwz6BCuPuVSxJ0fVDlIp5Q"
PROJECT_ID = "prj_uUugHVZNn0ihSEMOBFr2Sy7XjVlH"

# Google Analytics Measurement ID
# Actual GA4 property created by Rome Guerrero
GA_MEASUREMENT_ID = "G-ZY17EEGMSE"

def add_analytics_env_var() -> dict:
    """Add NEXT_PUBLIC_GA_MEASUREMENT_ID to Vercel"""

    url = f"https://api.vercel.com/v10/projects/{PROJECT_ID}/env"

    headers = {
        "Authorization": f"Bearer {VERCEL_TOKEN}",
        "Content-Type": "application/json"
    }

    params = {"teamId": TEAM_ID}

    payload = {
        "key": "NEXT_PUBLIC_GA_MEASUREMENT_ID",
        "value": GA_MEASUREMENT_ID,
        "type": "plain",  # Public env var, not encrypted
        "target": ["production", "preview", "development"]
    }

    response = requests.post(url, headers=headers, params=params, json=payload)

    return {
        "status_code": response.status_code,
        "response": response.json() if response.text else {}
    }

def main():
    print("=" * 60)
    print("ADDING GOOGLE ANALYTICS ENVIRONMENT VARIABLE")
    print("=" * 60)

    if not VERCEL_TOKEN:
        print("❌ ERROR: VERCEL_TOKEN environment variable not set")
        return

    if GA_MEASUREMENT_ID == "G-XXXXXXXXXX":
        print("⚠️  WARNING: Using placeholder GA Measurement ID")
        print("   You need to create a GA4 property and update GA_MEASUREMENT_ID")
        print()

    print(f"Adding: NEXT_PUBLIC_GA_MEASUREMENT_ID = {GA_MEASUREMENT_ID}")
    print()

    result = add_analytics_env_var()

    if result["status_code"] in [200, 201]:
        print("✅ SUCCESS: Environment variable added")
        print(json.dumps(result["response"], indent=2))
    elif result["status_code"] == 400 and "already exists" in str(result["response"]):
        print("⚠️  Variable already exists. To update, delete first then recreate.")
        print("   Or manually update in Vercel dashboard:")
        print("   https://vercel.com/settings/environment-variables")
    else:
        print(f"❌ ERROR: Failed to add environment variable")
        print(f"   Status: {result['status_code']}")
        print(f"   Response: {json.dumps(result['response'], indent=2)}")

    print()
    print("=" * 60)
    print("NEXT STEPS:")
    print("=" * 60)
    print("1. Create a Google Analytics 4 property:")
    print("   https://analytics.google.com/analytics/web/#/a{accountId}w{propertyId}p{appId}/admin/streams")
    print()
    print("2. Get your Measurement ID (format: G-XXXXXXXXXX)")
    print()
    print("3. Update this script with your actual Measurement ID")
    print()
    print("4. Re-run this script to add the env var")
    print()
    print("5. Redeploy to production:")
    print("   vercel --prod")
    print()

if __name__ == "__main__":
    main()
