const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const seedAdmin = async () => {
    try {
        // Wait for connection
        await new Promise(resolve => setTimeout(resolve, 1000));

        const email = 'admin@test.com';
        const password = 'password123';

        const userExists = await Admin.findOne({ email });

        if (userExists) {
            console.log('Admin already exists');
            process.exit();
        }

        const user = await Admin.create({
            name: 'Super Admin',
            email,
            password,
        });

        console.log('Admin created successfully:', user);
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

seedAdmin();
