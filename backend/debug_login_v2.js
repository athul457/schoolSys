const mongoose = require('mongoose');
const Teacher = require('./models/Teacher');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const debug = async () => {
    try {
        await mongoose.connect(process.env.DATABASE);
        const email = 'shereena123@gmail.com';
        const user = await Teacher.findOne({ email });

        if (user) {
            console.log('--- DEBUG INFO ---');
            console.log('TeacherID:', user.teacherId);
            console.log('Password (first 10 chars):', user.password.substring(0, 10));
            console.log('Is Bcrypt Hash?', user.password.startsWith('$2'));
            console.log('Is Plain Text Match?', user.password === user.teacherId);
            
            // Re-hash to see what it SHOULD look like
            const salt = await bcrypt.genSalt(10);
            const newHash = await bcrypt.hash(user.teacherId, salt);
            console.log('Test Hash would look like:', newHash.substring(0, 10) + '...');
        } else {
            console.log('User not found');
        }
    } catch (e) {
        console.error(e);
    }
    process.exit();
};

debug();
