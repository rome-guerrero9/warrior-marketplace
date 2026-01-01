#!/usr/bin/env python3
"""
Agent Alpha-5: Update Vercel Production Environment Variables
Configures production webhook secrets and email API key
"""
import requests
import json

# Vercel configuration
VERCEL_TOKEN = "L3fpdyJ8BUlgcgaqaoLF780Q"
PROJECT_ID = "prj_mAhBApa09USn0YAu8VhyUkeXwRwA"
TEAM_ID = "team_AdlqIIL1ADnTtMbut7tbFhWp"

# Environment variables to update
ENV_VARS = [
    {
        "key": "STRIPE_WEBHOOK_SECRET",
        "value": "whsec_agp53UL5DLV7i5sXA8fRT6znjLPCeC2w",
        "type": "encrypted",
        "target": ["production"]
    },
    {
        "key": "STRIPE_WEBHOOK_SECRET_BACKUP",
        "value": "whsec_rhG4IPe0iRsNr5xwejclCtl4P9oPULuf",
        "type": "encrypted",
        "target": ["production"]
    },
    {
        "key": "RESEND_API_KEY",
        "value": "ed_61Ttxbtmf5T2oUZIG16TDvj7MkSQ6Js07pdwS2QSuKQC",
        "type": "encrypted",
        "target": ["production"]
    }
]

def update_env_var(env_var: dict) -> dict:
    """Update or create an environment variable in Vercel"""
    url = f"https://api.vercel.com/v10/projects/{PROJECT_ID}/env"

    headers = {
        "Authorization": f"Bearer {VERCEL_TOKEN}",
        "Content-Type": "application/json"
    }

    # Add team ID to query params
    params = {"teamId": TEAM_ID}

    response = requests.post(url, headers=headers, params=params, json=env_var)

    return {
        "key": env_var["key"],
        "status_code": response.status_code,
        "success": response.ok,
        "response": response.json() if response.ok else response.text
    }

def main():
    print("🤖 Agent Alpha-5: Vercel Environment Variable Configuration")
    print("="*70)
    print("Mission: Configure production webhook secrets and email API key\n")

    results = []
    success_count = 0

    for env_var in ENV_VARS:
        print(f"📝 Updating: {env_var['key']}")
        result = update_env_var(env_var)
        results.append(result)

        if result["success"]:
            success_count += 1
            print(f"   ✅ Successfully updated")
        else:
            print(f"   ❌ Failed: {result['response']}")
        print()

    # Summary
    print("="*70)
    print("📊 CONFIGURATION SUMMARY")
    print("="*70)
    print(f"Total Variables: {len(ENV_VARS)}")
    print(f"Successfully Updated: {success_count}")
    print(f"Failed: {len(ENV_VARS) - success_count}")

    if success_count == len(ENV_VARS):
        print("\n✅ **ALL ENVIRONMENT VARIABLES UPDATED!**")
        print("\n🔄 Next Step: Redeploy to production")
        print("   Run: npx vercel --prod")
        print("\n✨ +60 Euphoria Points - Webhook Configuration Complete!")
        return True
    else:
        print("\n⚠️  Some variables failed to update")
        print("Check the error messages above for details")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
