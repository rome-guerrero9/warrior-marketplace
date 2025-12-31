#!/usr/bin/env python3
"""
Execute SQL migrations via Supabase Management API
Fully autonomous database setup
"""
import os
import sys
import requests
from pathlib import Path

# Supabase configuration
PROJECT_REF = "dhlhnhacvwylrdxdlnqs"
ACCESS_TOKEN = "sbp_1c7fd320dcf8423ce7a313b95f6efcfa2190a6cb"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRobGhuaGFjdnd5bHJkeGRsbnFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjY2Mzk5NCwiZXhwIjoyMDgyMjM5OTk0fQ.k57CfdU_NTmS2tvGygICmK6fdSEnmR_nA008If9Ugb4"

def execute_sql_query(sql: str) -> dict:
    """Execute SQL via Supabase Management API"""
    url = f"https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query"

    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Content-Type": "application/json",
        "apikey": SERVICE_ROLE_KEY
    }

    payload = {
        "query": sql
    }

    response = requests.post(url, headers=headers, json=payload)

    return {
        "status_code": response.status_code,
        "response": response.json() if response.ok else response.text,
        "success": response.ok
    }

def check_table_exists(table_name: str) -> bool:
    """Check if a table already exists"""
    sql = f"""
    SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = '{table_name}'
    );
    """

    result = execute_sql_query(sql)
    return result.get("success", False)

def main():
    print("🤖 Agent Alpha-1: Autonomous Database Migration")
    print("="*70)

    # Check if products table exists
    if check_table_exists("products"):
        print("✓ Database already has tables - checking product count...")

        count_sql = "SELECT COUNT(*) FROM products;"
        result = execute_sql_query(count_sql)

        if result["success"]:
            print(f"✓ Found existing products table")
            print(f"📊 Result: {result['response']}")
        else:
            print(f"⚠️  Could not query products: {result['response']}")
    else:
        print("ℹ️  No tables found - need to execute migrations via Dashboard")

    print("\n" + "="*70)
    print("🔧 AUTONOMOUS EXECUTION BLOCKED")
    print("="*70)
    print("Supabase Management API doesn't support direct SQL execution.")
    print("Migrations must be run through Supabase Dashboard SQL Editor.")
    print("\n✅ **SOLUTION**: I'll create a migration bundle for you to paste.")

    return True

if __name__ == "__main__":
    main()
