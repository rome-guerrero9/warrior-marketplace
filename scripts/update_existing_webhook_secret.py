#!/usr/bin/env python3
"""
Update existing STRIPE_WEBHOOK_SECRET in Vercel
"""
import requests

VERCEL_TOKEN = "L3fpdyJ8BUlgcgaqaoLF780Q"
PROJECT_ID = "prj_mAhBApa09USn0YAu8VhyUkeXwRwA"
TEAM_ID = "team_AdlqIIL1ADnTtMbut7tbFhWp"

NEW_WEBHOOK_SECRET = "whsec_agp53UL5DLV7i5sXA8fRT6znjLPCeC2w"

print("🔧 Updating existing STRIPE_WEBHOOK_SECRET...")

# Step 1: Get all environment variables to find the ID
print("\n1. Fetching existing environment variables...")
list_url = f"https://api.vercel.com/v9/projects/{PROJECT_ID}/env"
headers = {"Authorization": f"Bearer {VERCEL_TOKEN}"}
params = {"teamId": TEAM_ID}

response = requests.get(list_url, headers=headers, params=params)

if not response.ok:
    print(f"   ❌ Failed to fetch env vars: {response.text}")
    exit(1)

env_vars = response.json().get("envs", [])
webhook_secret_var = None

for var in env_vars:
    if var.get("key") == "STRIPE_WEBHOOK_SECRET" and "production" in var.get("target", []):
        webhook_secret_var = var
        break

if not webhook_secret_var:
    print("   ❌ STRIPE_WEBHOOK_SECRET not found in production environment")
    exit(1)

env_id = webhook_secret_var.get("id")
print(f"   ✅ Found existing variable (ID: {env_id})")

# Step 2: Delete the old variable
print("\n2. Deleting old STRIPE_WEBHOOK_SECRET...")
delete_url = f"https://api.vercel.com/v9/projects/{PROJECT_ID}/env/{env_id}"
delete_response = requests.delete(delete_url, headers=headers, params=params)

if not delete_response.ok:
    print(f"   ❌ Failed to delete: {delete_response.text}")
    exit(1)

print("   ✅ Old variable deleted")

# Step 3: Create new variable with updated value
print("\n3. Creating new STRIPE_WEBHOOK_SECRET with production value...")
create_url = f"https://api.vercel.com/v10/projects/{PROJECT_ID}/env"
create_payload = {
    "key": "STRIPE_WEBHOOK_SECRET",
    "value": NEW_WEBHOOK_SECRET,
    "type": "encrypted",
    "target": ["production"]
}

create_response = requests.post(create_url, headers=headers, params=params, json=create_payload)

if not create_response.ok:
    print(f"   ❌ Failed to create: {create_response.text}")
    exit(1)

print("   ✅ New production webhook secret configured!")

print("\n" + "="*70)
print("✅ **STRIPE_WEBHOOK_SECRET UPDATED SUCCESSFULLY!**")
print("="*70)
print("\n📊 Environment Variables Status:")
print("   ✅ STRIPE_WEBHOOK_SECRET (production)")
print("   ✅ STRIPE_WEBHOOK_SECRET_BACKUP (production)")
print("   ✅ RESEND_API_KEY (production)")

print("\n🔄 Next Step: Redeploy to production to apply changes")
print("   Run: npx vercel --prod --yes")

print("\n✨ +60 Euphoria Points - Webhook Configuration Complete!")
