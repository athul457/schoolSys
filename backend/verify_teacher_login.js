const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Teacher = require('./models/Teacher');
const connectDB = require('./config/db');

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.DATABASE);
        console.log('DB Connected');

        const testId = 'T_TEST_' + Date.now();
        const testEmail = 'teacher_' + Date.now() + '@test.com';
        const testPass = testId;

        console.log(`Creating Teacher: ID=${testId}, Email=${testEmail}, Pass=${testPass}`);

        // Simulate Admin Controller Logic
        const teacher = await Teacher.create({
            teacherId: testId,
            name: 'Test Teacher',
            email: testEmail,
            // Explicitly verify this is passed as string
            password: testId, 
            subject: 'Math',
            classConfig: '10A'
        });

        console.log('Teacher Created. Hashed Password in DB:', teacher.password);

        // Simulate Login Controller Logic
        const found = await Teacher.findOne({ email: testEmail });
        console.log('Found User:', found ? found.email : 'Not Found');

        if (found) {
            const isMatch = await found.matchPassword(testPass);
            console.log(`Matching password '${testPass}':`, isMatch);
        }

        await Teacher.deleteOne({ _id: teacher._id });
        console.log('Cleanup done');
        process.exit();

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
