#!/usr/bin/env python3
"""
Quick check: Are products actually in the database?
"""
import requests

PROJECT_REF = "dhlhnhacvwylrdxdlnqs"
ACCESS_TOKEN = "sbp_1c7fd320dcf8423ce7a313b95f6efcfa2190a6cb"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRobGhuaGFjdnd5bHJkeGRsbnFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjY2Mzk5NCwiZXhwIjoyMDgyMjM5OTk0fQ.k57CfdU_NTmS2tvGygICmK6fdSEnmR_nA008If9Ugb4"

def execute_sql(sql: str) -> dict:
    url = f"https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query"
    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Content-Type": "application/json",
        "apikey": SERVICE_ROLE_KEY
    }
    response = requests.post(url, headers=headers, json={"query": sql})
    return {"status": response.status_code, "data": response.json() if response.ok else response.text, "success": response.ok}

print("🔍 Checking products in database...")
print("="*70)

# Check total count
result1 = execute_sql("SELECT COUNT(*) as total FROM products;")
print(f"\n1. Total products: {result1}")

# Check active count
result2 = execute_sql("SELECT COUNT(*) as active_count FROM products WHERE status = 'active';")
print(f"\n2. Active products: {result2}")

# Check product names
result3 = execute_sql("SELECT name, status, price_cents FROM products ORDER BY price_cents;")
print(f"\n3. Product details: {result3}")

# Check RLS status
result4 = execute_sql("""
    SELECT schemaname, tablename, rowsecurity
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'products';
""")
print(f"\n4. RLS status: {result4}")
