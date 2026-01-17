const mongoose = require('mongoose');
console.log('Mongoose loaded');

try {
    const Teacher = require('./models/Teacher');
    console.log('Teacher model loaded');
} catch (e) {
    console.error('Failed to load Teacher model:', e);
}

try {
    const connectDB = require('./config/db');
    console.log('ConnectDB loaded');
} catch (e) {
    console.error('Failed to load db config:', e);
}

const dotenv = require('dotenv');
dotenv.config();
console.log('Dotenv loaded');

async function run() {
    try {
        console.log('Connecting to DB...');
        const connectDB = require('./config/db');
        await connectDB();
        console.log('Connected to DB');

        console.log('Finding teacher...');
        const Teacher = require('./models/Teacher');
        const teacher = await Teacher.findOne({ email: 'alka123@gmail.com' });
        console.log('Teacher query result:', teacher);

        if (teacher) {
            console.log('Updating password...');
            teacher.password = teacher.teacherId.trim();
            await teacher.save();
            console.log('Password updated.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Runtime Error:', error);
        process.exit(1);
    }
}

run();
