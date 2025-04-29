import bcrypt from 'bcrypt';

async function generateHash(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

async function main() {
  const users = [
    { email: 'jane.doe@acme.com', role: 'owner', password: 'jane' },
    { email: 'john.smith@acme.com', role: 'employee', password: 'john' },
    // Add more users as needed
  ];

  console.log('Generating bcrypt hashes for users:');
  console.log('-----------------------------------');

  for (const user of users) {
    const hash = await generateHash(user.password);
    console.log(`User: ${user.email} (${user.role})`);
    console.log(`Password: ${user.password}`);
    console.log(`Hash: ${hash}`);
    console.log('-----------------------------------');
  }
}

main().catch(console.error); 