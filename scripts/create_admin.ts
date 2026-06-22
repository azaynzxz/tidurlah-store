import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
// We'll use the service role key retrieved from the Management API
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmbHNjYnJ5Y3BtbGZndmd3ZWx5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDAwODk1MiwiZXhwIjoyMDk1NTg0OTUyfQ.Y_0ARtV_309U4VfnrguNxGP5szlbTZv6sgNVOLu14CU';

if (!SUPABASE_URL) {
  console.error('❌ VITE_SUPABASE_URL is missing. Check .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@google.com';
  const password = process.env.ADMIN_PASSWORD || 'TidurlahAdmin2026!';

  console.log(`👤 Creating admin user: ${email}...`);

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: 'admin',
      full_name: 'Super Admin'
    }
  });

  if (error) {
    console.error('❌ Failed to create admin user:', error.message);
    process.exit(1);
  }

  console.log('✅ Admin user created successfully in auth.users!');
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log('   Profile should be auto-created in public.profiles by database trigger.\n');
  
  // Verify profile
  console.log('🔍 Checking profile table...');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError) {
    console.error('⚠️ Profile verification warning:', profileError.message);
  } else {
    console.log('✅ Verified profile:', profile);
  }
}

main();
