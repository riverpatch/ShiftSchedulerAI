import { createClient } from '@supabase/supabase-js';
import bcryptjs from 'bcryptjs';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkUser() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'jane.doe@acme.com')
      .eq('role', 'Owner')
      .single();

    if (error) {
      console.error('Database error:', error);
      return;
    }

    if (!data) {
      console.log('User not found');
      return;
    }

    console.log('User found:', {
      email: data.email,
      role: data.role,
      status: data.status,
      hash: data.password_hash
    });

    // Test password verification
    const testPassword = 'jane123';
    const isValid = await bcryptjs.compare(testPassword, data.password_hash);
    console.log('\nPassword verification test:');
    console.log('Test password:', testPassword);
    console.log('Is password valid?', isValid);

  } catch (error) {
    console.error('Error:', error);
  }
}

checkUser().catch(console.error); 