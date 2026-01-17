const mongoose = require('mongoose');
const Teacher = require('./models/Teacher');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const debugLogin = async () => {
    await connectDB();

    const email = 'shereena123@gmail.com';
    // The password from the user's provided file content
    const passwordAttempt = 'TEA80253S'; 
    // Also try with trailing dot as seen in file? "// ID: TEA94753A." -> maybe they copied the dot?
    // The user wrote: "// ID: TEA80253S"

    const user = await Teacher.findOne({ email });

    if (!user) {
        console.log('User NOT found in DB');
    } else {
        console.log('User FOUND:', user.name);
        console.log('Stored TeacherID:', user.teacherId);
        console.log('Stored Hashed Password:', user.password);
        console.log('Is Suspended:', user.isSuspended);

        const isMatch = await user.matchPassword(passwordAttempt);
        console.log(`Password Match with '${passwordAttempt}':`, isMatch);
        
        // Debugging hash manually
        const directCompare = await bcrypt.compare(passwordAttempt, user.password);
        console.log(`Direct Bcrypt Compare with '${passwordAttempt}':`, directCompare);

        // Check if maybe there is a trailing space in the stored ID?
        console.log('TeacherId char codes:', user.teacherId.split('').map(c => c.charCodeAt(0)));
    }

    process.exit();
};

debugLogin();
