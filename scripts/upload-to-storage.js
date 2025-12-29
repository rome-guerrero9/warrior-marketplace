#!/usr/bin/env node
/**
 * Upload MCP packages to Supabase Storage
 * Usage: node scripts/upload-to-storage.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = 'products';
const PACKAGES_DIR = '/home/romex/gumroad-products';

const packages = [
  'mcp-starter-pack.tar.gz',
  'mcp-pro-pack.tar.gz',
  'mcp-agency-suite.tar.gz'
];

async function ensureBucketExists() {
  console.log('🔍 Checking if bucket exists...');

  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error('❌ Error listing buckets:', listError.message);
    return false;
  }

  const bucketExists = buckets.some(b => b.name === BUCKET_NAME);

  if (!bucketExists) {
    console.log('📦 Creating bucket:', BUCKET_NAME);
    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['application/gzip', 'application/x-tar', 'application/x-gzip']
    });

    if (createError) {
      console.error('❌ Error creating bucket:', createError.message);
      return false;
    }

    console.log('✅ Bucket created successfully!');
  } else {
    console.log('✅ Bucket already exists');
  }

  return true;
}

async function uploadFile(fileName) {
  const filePath = path.join(PACKAGES_DIR, fileName);
  const storagePath = `downloads/${fileName}`;

  console.log(`\n📤 Uploading: ${fileName}`);

  // Check if file exists locally
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return null;
  }

  const fileBuffer = fs.readFileSync(filePath);
  const fileSizeKB = (fileBuffer.length / 1024).toFixed(2);
  console.log(`   Size: ${fileSizeKB} KB`);

  // Upload file
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, fileBuffer, {
      contentType: 'application/gzip',
      upsert: true // Overwrite if exists
    });

  if (error) {
    console.error(`❌ Upload failed: ${error.message}`);
    return null;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath);

  const publicUrl = urlData.publicUrl;
  console.log(`✅ Uploaded successfully!`);
  console.log(`   URL: ${publicUrl}`);

  return publicUrl;
}

async function updateProductUrls(urls) {
  console.log('\n🔄 Updating product download URLs in database...');

  const updates = [
    { slug: 'mcp-starter-pack', url: urls[0] },
    { slug: 'mcp-pro-pack', url: urls[1] },
    { slug: 'mcp-agency-suite', url: urls[2] }
  ];

  for (const update of updates) {
    if (!update.url) continue;

    const { error } = await supabase
      .from('products')
      .update({ download_url: update.url })
      .eq('slug', update.slug);

    if (error) {
      console.error(`❌ Failed to update ${update.slug}: ${error.message}`);
    } else {
      console.log(`✅ Updated: ${update.slug}`);
    }
  }
}

async function main() {
  console.log('🚀 Supabase Storage Upload Script\n');
  console.log('Supabase URL:', supabaseUrl);
  console.log('Bucket:', BUCKET_NAME);
  console.log('Packages directory:', PACKAGES_DIR);
  console.log('=' .repeat(50));

  // Ensure bucket exists
  const bucketReady = await ensureBucketExists();
  if (!bucketReady) {
    console.error('\n❌ Setup failed. Please check Supabase credentials and permissions.');
    process.exit(1);
  }

  // Upload all packages
  const urls = [];
  for (const pkg of packages) {
    const url = await uploadFile(pkg);
    urls.push(url);
  }

  // Check if all uploads succeeded
  const allSuccess = urls.every(url => url !== null);

  if (allSuccess) {
    console.log('\n' + '='.repeat(50));
    console.log('✅ All files uploaded successfully!\n');

    // Update database
    await updateProductUrls(urls);

    console.log('\n' + '='.repeat(50));
    console.log('✅ UPLOAD COMPLETE!\n');
    console.log('📦 Storage URLs:');
    packages.forEach((pkg, i) => {
      console.log(`   ${pkg}: ${urls[i]}`);
    });

    console.log('\n🎯 Next steps:');
    console.log('   1. Verify files in Supabase Dashboard → Storage → products');
    console.log('   2. Test download URLs by visiting them in browser');
    console.log('   3. Run: npm run dev');
    console.log('   4. Test product purchases on http://localhost:3000\n');

  } else {
    console.error('\n❌ Some uploads failed. Please check the errors above and try again.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n❌ Unexpected error:', error);
  process.exit(1);
});
