import { createClient } from '@supabase/supabase-js';
import bcryptjs from 'bcryptjs';

const SUPABASE_URL = 'https://uetlaizwgocjgxklaynz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVldGxhaXp3Z29jamd4a2xheW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA2MjY0MDAsImV4cCI6MjAyNjIwMjQwMH0.SYZxnJwTvFhL7yp9ykDDDJ-vJigPpOQHwPMBixbUveY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verifyLogin() {
  try {
    // 1. First get the user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'jane.doe@acme.com')
      .eq('role', 'Owner')
      .single();

    if (userError) {
      console.error('Database error:', userError);
      return;
    }

    if (!userData) {
      console.log('User not found');
      return;
    }

    console.log('\nUser data found:');
    console.log('----------------');
    console.log('Email:', userData.email);
    console.log('Role:', userData.role);
    console.log('Status:', userData.status);
    console.log('Stored hash:', userData.password_hash);

    // 2. Test password verification
    const testPassword = 'jane123';
    const isValid = await bcryptjs.compare(testPassword, userData.password_hash);
    
    console.log('\nPassword verification test:');
    console.log('-------------------------');
    console.log('Test password:', testPassword);
    console.log('Is password valid?', isValid);

    // 3. Generate a new hash for comparison
    const newHash = await bcryptjs.hash(testPassword, 12);
    console.log('\nNew hash generation:');
    console.log('------------------');
    console.log('New hash:', newHash);
    
    // 4. Verify the new hash works
    const isValidNewHash = await bcryptjs.compare(testPassword, newHash);
    console.log('New hash verification:', isValidNewHash);

  } catch (error) {
    console.error('Error:', error);
  }
}

verifyLogin().catch(console.error); 