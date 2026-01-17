// const mongoose = require('mongoose');
// const dotenv = require('dotenv');

// dotenv.config();

// const fixTeacherParams = async () => {
//     try {
//         const connectDB = require('./config/db');
//         await connectDB();
        
//         // allow time for connection
//         await new Promise(r => setTimeout(r, 1000));

//         const email = 'alka123@gmail.com'; 
//         const Teacher = require('./models/Teacher');
//         const teacher = await Teacher.findOne({ email });

//         if (teacher) {
//             console.log(`Found teacher: ${teacher.name} (${teacher.teacherId})`);
            
//             // Reset password to teacherId (trimmed)
//             teacher.password = teacher.teacherId.trim();
//             await teacher.save();
            
//             console.log(`Password reset to: '${teacher.teacherId.trim()}'`);
//         } else {
//             console.log(`Teacher with email ${email} not found.`);
//         }
//         process.exit();
//     } catch (error) {
//         if (error.name === 'ValidationError') {
//              for (field in error.errors) {
//                  console.log(`Validation Error: ${field} - ${error.errors[field].message}`);
//              }
//         }
//         console.error('Error:', error);
//         process.exit(1);
//     }
// };

// fixTeacherParams();
// ```
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config();

const fixTeacherParams = async () => {
  try {
    const connectDB = require("./config/db");
    await connectDB();

    const email = "alka123@gmail.com";
    const Teacher = require("./models/Teacher");

    const teacher = await Teacher.findOne({ email });

    if (!teacher) {
      console.log(`Teacher with email ${email} not found.`);
      await mongoose.connection.close();
      return;
    }

    console.log(`Found teacher: ${teacher.name} (${teacher.teacherId})`);

    // Hash teacherId before saving as password
    const hashedPassword = await bcrypt.hash(
      teacher.teacherId.trim(),
      10
    );

    teacher.password = hashedPassword;
    await teacher.save();

    console.log(
      `Password successfully reset to hashed teacherId`
    );

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    if (error.name === "ValidationError") {
      for (const field in error.errors) {
        console.log(
          `Validation Error: ${field} - ${error.errors[field].message}`
        );
      }
    } else {
      console.error("Error:", error);
    }

    await mongoose.connection.close();
    process.exit(1);
  }
};

fixTeacherParams();
