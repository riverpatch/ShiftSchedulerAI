import { createClient } from '@supabase/supabase-js';
import bcryptjs from 'bcryptjs';

async function updatePassword() {
    const password = 'jane123';
    const saltRounds = 12;
    const hash = await bcryptjs.hash(password, saltRounds);
    
    console.log('Generated hash for password:', password);
    console.log('Hash:', hash);
    console.log('\nPlease update this hash in your Supabase dashboard for the user jane.doe@acme.com');
}

updatePassword().catch(console.error); 