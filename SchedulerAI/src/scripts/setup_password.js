const bcryptjs = require('bcryptjs');

async function generateHash() {
    const password = 'jane123';
    const saltRounds = 12;
    const hash = await bcryptjs.hash(password, saltRounds);
    console.log('Password:', password);
    console.log('Hash:', hash);
}

generateHash().catch(console.error); 