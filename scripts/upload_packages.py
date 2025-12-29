#!/usr/bin/env python3
"""
Upload MCP packages to Supabase Storage
Run this script in WSL to upload the .tar.gz files
"""

import os
import sys
from pathlib import Path

# Check for required package
try:
    from supabase import create_client, Client
except ImportError:
    print("Installing supabase-py...")
    os.system("pip install supabase")
    from supabase import create_client, Client

# Configuration
SUPABASE_URL = "https://dhlhnhacvwylrdxdlnqs.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRobGhuaGFjdnd5bHJkeGRsbnFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjY2Mzk5NCwiZXhwIjoyMDgyMjM5OTk0fQ.k57CfdU_NTmS2tvGygICmK6fdSEnmR_nA008If9Ugb4"

BUCKET_NAME = "product-files"
PRODUCTS_DIR = Path.home() / "gumroad-products"

# Files to upload with their slugs
FILES_TO_UPLOAD = [
    ("mcp-starter-pack.tar.gz", "mcp-starter-pack"),
    ("mcp-pro-pack.tar.gz", "mcp-pro-pack"),
    ("mcp-agency-suite.tar.gz", "mcp-agency-suite"),
]

def main():
    print("🚀 Uploading MCP packages to Supabase Storage...")
    print(f"   Bucket: {BUCKET_NAME}")
    print(f"   Source: {PRODUCTS_DIR}")
    print()

    # Create Supabase client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    uploaded_urls = []

    for filename, slug in FILES_TO_UPLOAD:
        filepath = PRODUCTS_DIR / filename
        
        if not filepath.exists():
            print(f"❌ File not found: {filepath}")
            continue
        
        print(f"📦 Uploading {filename}...")
        
        try:
            # Read file content
            with open(filepath, "rb") as f:
                file_content = f.read()
            
            # Upload to Supabase Storage
            response = supabase.storage.from_(BUCKET_NAME).upload(
                path=filename,
                file=file_content,
                file_options={"content-type": "application/gzip", "upsert": "true"}
            )
            
            # Get public URL
            public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(filename)
            
            print(f"   ✅ Uploaded: {public_url}")
            uploaded_urls.append((slug, public_url))
            
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    print()
    print("=" * 60)
    print("📋 UPDATE DATABASE WITH DOWNLOAD URLs")
    print("=" * 60)
    print()
    print("Run this SQL in Supabase SQL Editor:")
    print()
    
    for slug, url in uploaded_urls:
        print(f"UPDATE products SET download_url = '{url}' WHERE slug = '{slug}';")
    
    print()
    print("🎉 Upload complete!")

if __name__ == "__main__":
    main()
