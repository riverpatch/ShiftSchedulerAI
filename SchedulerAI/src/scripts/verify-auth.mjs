import { createClient } from '@supabase/supabase-js';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file (2 directories up from scripts folder)
config({ path: join(__dirname, '../../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

console.log('Using Supabase URL:', SUPABASE_URL);
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verifyAuth() {
  try {
    console.log('\n1. Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('*');

    if (testError) {
      console.error('Database connection error:', testError);
      return;
    }
    console.log('✓ Database connection successful!');
    console.log('Total users:', testData ? testData.length : 0);

    // Array of test users to verify/create
    const testUsers = [
      {
        email: 'jane.doe@acme.com',
        password: 'jane123',
        role: 'Owner',
        name: 'Jane Doe'
      },
      {
        email: 'john.smith@acme.com',
        password: 'john123',
        role: 'Employee',
        name: 'John Smith'
      }
    ];

    for (const testUser of testUsers) {
      console.log(`\n2. Looking for ${testUser.role} user (${testUser.email})...`);
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', testUser.email)
        .eq('role', testUser.role)
        .single();

      if (userError) {
        console.error('Error fetching user:', userError);
        continue;
      }

      if (!userData) {
        console.log('User not found. Creating test user...');
        const hash = await bcryptjs.hash(testUser.password, 12);
        
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([{
            email: testUser.email,
            password_hash: hash,
            role: testUser.role,
            name: testUser.name,
            status: 'active'
          }])
          .select()
          .single();

        if (createError) {
          console.error('Error creating user:', createError);
          continue;
        }

        console.log('✓ User created successfully!');
        console.log('User details:', {
          email: newUser.email,
          role: newUser.role,
          status: newUser.status
        });
      } else {
        console.log('✓ User found:', {
          email: userData.email,
          role: userData.role,
          status: userData.status
        });

        console.log('\n3. Testing password verification...');
        console.log('Testing password:', testUser.password);
        console.log('Stored hash:', userData.password_hash);
        const isValid = await bcryptjs.compare(testUser.password, userData.password_hash);
        console.log('Password verification result:', isValid ? '✓ Valid' : '✗ Invalid');

        if (!isValid) {
          console.log('\n4. Updating password hash...');
          const newHash = await bcryptjs.hash(testUser.password, 12);
          console.log('New hash generated:', newHash);
          
          const { error: updateError } = await supabase
            .from('users')
            .update({ password_hash: newHash })
            .eq('email', testUser.email)
            .eq('role', testUser.role);

          if (updateError) {
            console.error('Error updating password:', updateError);
            continue;
          }

          console.log('✓ Password hash updated successfully!');
        }
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

verifyAuth().catch(console.error); 