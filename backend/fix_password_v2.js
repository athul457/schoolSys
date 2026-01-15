const mongoose = require('mongoose');
const Teacher = require('./models/Teacher');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.DATABASE);
        console.log('DB Connected');
        
        // Target specific user
        const email = 'alka123@gmail.com'; 
        const teacher = await Teacher.findOne({ email });

        if (teacher) {
            console.log(`Resetting password for ${teacher.name}`);
            const newPass = teacher.teacherId.trim();
            teacher.password = newPass;

            // Debug: Check if other fields are valid
            if (!teacher.name) teacher.name = "Fixed Name";
            if (!teacher.subject) teacher.subject = "Fixed Subject";

            await teacher.save();
            console.log(`Success! Password is now: '${newPass}'`);
        } else {
            console.log('User not found');
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

run();
