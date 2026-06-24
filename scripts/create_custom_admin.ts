import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tflscbrycpmlfgvgwely.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmbHNjYnJ5Y3BtbGZndmd3ZWx5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDAwODk1MiwiZXhwIjoyMDk1NTg0OTUyfQ.Y_0ARtV_309U4VfnrguNxGP5szlbTZv6sgNVOLu14CU';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  const emailCandidate = 'admin@nomo';
  const password = 'n0m0balam';

  console.log(`👤 Attempting to create admin user: ${emailCandidate}...`);

  let finalEmail = emailCandidate;
  
  const { data, error } = await supabase.auth.admin.createUser({
    email: finalEmail,
    password: password,
    email_confirm: true,
    user_metadata: {
      role: 'admin',
      full_name: 'Nomo Admin'
    }
  });

  if (error) {
    if (error.message.toLowerCase().includes('email') || error.message.toLowerCase().includes('format') || error.message.toLowerCase().includes('invalid')) {
      console.log(`\n⚠️  Could not use '${emailCandidate}' due to email formatting rules. Retrying with 'admin@nomo.com'...`);
      finalEmail = 'admin@nomo.com';
      
      const { data: fallbackData, error: fallbackError } = await supabase.auth.admin.createUser({
        email: finalEmail,
        password: password,
        email_confirm: true,
        user_metadata: {
          role: 'admin',
          full_name: 'Nomo Admin'
        }
      });
      
      if (fallbackError) {
        console.error('❌ Failed to create admin user with fallback:', fallbackError.message);
        process.exit(1);
      }
      
      console.log('✅ Admin user created successfully with fallback!');
      console.log(`   Email: ${finalEmail}`);
      console.log(`   Password: ${password}`);
    } else {
      console.error('❌ Failed to create admin user:', error.message);
      process.exit(1);
    }
  } else {
    console.log('✅ Admin user created successfully!');
    console.log(`   Email: ${finalEmail}`);
    console.log(`   Password: ${password}`);
  }
}

main();
