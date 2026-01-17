const mongoose = require('mongoose');
const Teacher = require('./models/Teacher');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const fixPassword = async () => {
    try {
        await mongoose.connect(process.env.DATABASE);
        console.log('Connected to DB');

        const email = 'shereena123@gmail.com';
        const teacherId = 'TEA80253S';
        
        const user = await Teacher.findOne({ email });

        if (user) {
            console.log('Found user:', user.name);
            
            // Manually hash and save
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(teacherId, salt);
            
            user.password = hashedPassword;
            // Bypass pre-save hook just in case, or let it run (it checks isModified)
            await Teacher.updateOne({ _id: user._id }, { password: hashedPassword });
            
            console.log('Password has been manually reset to:', teacherId);
            console.log('New Hash:', hashedPassword);
        } else {
            console.log('User not found!');
        }
    } catch (e) {
        console.error(e);
    }
    process.exit();
};

fixPassword();
