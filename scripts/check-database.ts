#!/usr/bin/env tsx
/**
 * Check database connection and migration status
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function checkDatabase() {
  console.log('🔍 Checking database connection...\n');

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Check connection
    console.log('✓ Connecting to:', supabaseUrl);

    // Check if tables exist
    const tables = ['profiles', 'products', 'orders', 'order_items', 'downloads', 'reviews', 'carts'];

    for (const table of tables) {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`✗ Table "${table}" - NOT FOUND or ERROR:`, error.message);
      } else {
        console.log(`✓ Table "${table}" - EXISTS (${count} rows)`);
      }
    }

    // Check products specifically
    console.log('\n📦 Checking products table...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');

    if (productsError) {
      console.log('✗ Error reading products:', productsError.message);
    } else {
      console.log(`✓ Products table accessible - ${products?.length || 0} products found`);
      if (products && products.length > 0) {
        console.log('\nExisting products:');
        products.forEach((p: any) => {
          console.log(`  - ${p.name} ($${p.price_cents / 100})`);
        });
      }
    }

  } catch (error: any) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

checkDatabase();
