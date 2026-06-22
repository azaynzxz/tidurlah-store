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

const usersToCreate = [
  {
    email: 'stevan@idcardlampung.com',
    password: 'CEOl4ginyamar2026!',
    metadata: {
      role: 'admin',
      full_name: 'Stevan'
    }
  },
  {
    email: 'zayn@idcardlampung.com',
    password: 'D3signers!2026',
    metadata: {
      role: 'admin', // Let's give admin access as well or cashier
      full_name: 'Zayn'
    }
  }
];

async function createNewUser(email: string, password: string, metadata: { role: string; full_name: string }) {
  console.log(`👤 Creating user: ${email}...`);

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata
  });

  if (error) {
    if (error.message.includes('already exists') || error.message.includes('already registered')) {
      console.log(`⚠️ User ${email} already exists.`);
      return;
    }
    console.error(`❌ Failed to create user ${email}:`, error.message);
    return;
  }

  console.log(`✅ User ${email} created successfully!`);
}

async function main() {
  for (const user of usersToCreate) {
    await createNewUser(user.email, user.password, user.metadata);
  }
  console.log('\n🎉 Finished creating users.');
}

main();
