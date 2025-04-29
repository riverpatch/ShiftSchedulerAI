const { createClient } = require('@supabase/supabase-js');
const bcryptjs = require('bcryptjs');

// Supabase configuration
const SUPABASE_URL = 'https://uetlaizwgocjgxklaynz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVldGxhaXp3Z29jamd4a2xheW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA2MjY0MDAsImV4cCI6MjAyNjIwMjQwMH0.SYZxnJwTvFhL7yp9ykDDDJ-vJigPpOQHwPMBixbUveY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verifyAndUpdate() {
  try {
    console.log('1. Checking database connection...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count(*)')
      .single();

    if (testError) {
      console.error('Database connection error:', testError);
      return;
    }

    console.log('Database connection successful!\n');

    console.log('2. Looking for user record...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'jane.doe@acme.com')
      .eq('role', 'Owner')
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return;
    }

    if (!userData) {
      console.log('User not found. Creating new user...');
      const password = 'jane123';
      const hash = await bcryptjs.hash(password, 12);
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{
          email: 'jane.doe@acme.com',
          password_hash: hash,
          role: 'Owner',
          name: 'Jane Doe',
          status: 'active'
        }])
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        return;
      }

      console.log('User created successfully!');
      userData = newUser;
    }

    console.log('\nUser found:', {
      email: userData.email,
      role: userData.role,
      status: userData.status
    });

    console.log('\n3. Testing password verification...');
    const testPassword = 'jane123';
    const isValid = await bcryptjs.compare(testPassword, userData.password_hash);
    console.log('Password verification result:', isValid);

    if (!isValid) {
      console.log('\n4. Updating password hash...');
      const newHash = await bcryptjs.hash(testPassword, 12);
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ password_hash: newHash })
        .eq('email', 'jane.doe@acme.com')
        .eq('role', 'Owner');

      if (updateError) {
        console.error('Error updating password:', updateError);
        return;
      }

      console.log('Password hash updated successfully!');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

verifyAndUpdate().catch(console.error); 