#!/usr/bin/env python3
"""
Agent Alpha-2: Storage & Asset Manager
Autonomous file upload to Supabase Storage
"""
import os
import sys
import requests
from pathlib import Path

# Supabase configuration
SUPABASE_URL = "https://dhlhnhacvwylrdxdlnqs.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRobGhuaGFjdnd5bHJkeGRsbnFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjY2Mzk5NCwiZXhwIjoyMDgyMjM5OTk0fQ.k57CfdU_NTmS2tvGygICmK6fdSEnmR_nA008If9Ugb4"

# Files to upload
FILES = [
    {
        "path": "/home/romex/gumroad-products/mcp-starter-pack.tar.gz",
        "storage_path": "products/mcp-starter-pack.tar.gz",
        "content_type": "application/gzip"
    },
    {
        "path": "/home/romex/gumroad-products/mcp-pro-pack.tar.gz",
        "storage_path": "products/mcp-pro-pack.tar.gz",
        "content_type": "application/gzip"
    },
    {
        "path": "/home/romex/gumroad-products/mcp-agency-suite.tar.gz",
        "storage_path": "products/mcp-agency-suite.tar.gz",
        "content_type": "application/gzip"
    },
    {
        "path": "/mnt/c/Users/romeg/Downloads/AgentFlowPro.zip",
        "storage_path": "products/AgentFlowPro.zip",
        "content_type": "application/zip"
    }
]

def create_bucket(bucket_name: str) -> dict:
    """Create storage bucket if it doesn't exist"""
    url = f"{SUPABASE_URL}/storage/v1/bucket"

    headers = {
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "apikey": SERVICE_ROLE_KEY,
        "Content-Type": "application/json"
    }

    payload = {
        "id": bucket_name,
        "name": bucket_name,
        "public": True,
        "file_size_limit": 52428800  # 50MB
    }

    response = requests.post(url, headers=headers, json=payload)

    return {
        "status_code": response.status_code,
        "success": response.status_code in [200, 201] or "already exists" in response.text.lower(),
        "response": response.json() if response.ok else response.text
    }

def upload_file(file_info: dict) -> dict:
    """Upload a file to Supabase Storage"""
    bucket = "products"
    filepath = Path(file_info["path"])

    if not filepath.exists():
        return {"success": False, "error": f"File not found: {filepath}"}

    url = f"{SUPABASE_URL}/storage/v1/object/{bucket}/{file_info['storage_path']}"

    headers = {
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "apikey": SERVICE_ROLE_KEY,
        "Content-Type": file_info["content_type"]
    }

    with open(filepath, "rb") as f:
        file_content = f.read()

    response = requests.post(url, headers=headers, data=file_content)

    public_url = f"{SUPABASE_URL}/storage/v1/object/public/{bucket}/{file_info['storage_path']}"

    return {
        "success": response.ok,
        "status_code": response.status_code,
        "response": response.json() if response.ok else response.text,
        "public_url": public_url if response.ok else None,
        "file_size": len(file_content)
    }

def main():
    print("🤖 Agent Alpha-2: Storage & Asset Manager")
    print("="*70)
    print("Mission: Upload 4 product files to Supabase Storage\n")

    # Step 1: Create bucket
    print("📦 Creating 'products' bucket...")
    bucket_result = create_bucket("products")

    if bucket_result["success"]:
        print(f"✓ Bucket ready: products")
    else:
        print(f"⚠️  Bucket status: {bucket_result['response']}")

    # Step 2: Upload files
    uploaded_count = 0
    public_urls = {}

    for file_info in FILES:
        filename = Path(file_info["path"]).name
        print(f"\n📤 Uploading: {filename}")

        result = upload_file(file_info)

        if result["success"]:
            uploaded_count += 1
            size_kb = result["file_size"] / 1024
            print(f"   ✓ Uploaded ({size_kb:.1f} KB)")
            print(f"   📎 URL: {result['public_url']}")
            public_urls[filename] = result["public_url"]
        else:
            print(f"   ❌ Failed: {result.get('response', 'Unknown error')}")

    # Summary
    print("\n" + "="*70)
    print("📊 UPLOAD SUMMARY")
    print("="*70)
    print(f"Total Files: {len(FILES)}")
    print(f"Uploaded: {uploaded_count}")
    print(f"Success Rate: {uploaded_count/len(FILES):.1%}")

    if uploaded_count == len(FILES):
        print("\n✅ **ALL FILES UPLOADED SUCCESSFULLY!**")
        print("\n🔗 Public URLs:")
        for filename, url in public_urls.items():
            print(f"   • {filename}: {url}")

        # Euphoria reward
        print("\n✨ +75 Euphoria Points - Flawless Execution!")

        return True
    else:
        print("\n⚠️  Some files failed to upload")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
