const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const fixTeacherParams = async () => {
    try {
        const connectDB = require('./config/db');
        await connectDB();
        
        // allow time for connection
        await new Promise(r => setTimeout(r, 1000));

        const email = 'alka123@gmail.com'; 
        const Teacher = require('./models/Teacher');
        const teacher = await Teacher.findOne({ email });

        if (teacher) {
            console.log(`Found teacher: ${teacher.name} (${teacher.teacherId})`);
            
            // Reset password to teacherId (trimmed)
            teacher.password = teacher.teacherId.trim();
            await teacher.save();
            
            console.log(`Password reset to: '${teacher.teacherId.trim()}'`);
        } else {
            console.log(`Teacher with email ${email} not found.`);
        }
        process.exit();
    } catch (error) {
        if (error.name === 'ValidationError') {
             for (field in error.errors) {
                 console.log(`Validation Error: ${field} - ${error.errors[field].message}`);
             }
        }
        console.error('Error:', error);
        process.exit(1);
    }
};

fixTeacherParams();
```
