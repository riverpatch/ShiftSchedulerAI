import bcryptjs from 'bcryptjs';

const password = 'jane123';
const saltRounds = 12;

bcryptjs.hash(password, saltRounds).then(hash => {
    console.log('Password:', password);
    console.log('Hash:', hash);
}).catch(console.error); 