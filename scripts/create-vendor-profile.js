#!/usr/bin/env node
/**
 * Create vendor profile in profiles table
 * This is required for products to have a valid vendor_id
 */
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const VENDOR_ID = 'a0000000-0000-0000-0000-000000000001';

async function createVendorProfile() {
  console.log('👤 Creating vendor profile...\n');

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: VENDOR_ID,
      email: 'rome@warrioraiautomations.com',
      full_name: 'Rome Guerrero - Warrior AI Automations',
      role: 'vendor',
      avatar_url: 'https://avatars.githubusercontent.com/u/warrior-ai'
    }, {
      onConflict: 'id'
    })
    .select();

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  console.log('✅ Vendor profile created!');
  console.log('   ID:', VENDOR_ID);
  console.log('   Email:', 'rome@warrioraiautomations.com');
  console.log('   Role:', 'vendor');
}

createVendorProfile();
