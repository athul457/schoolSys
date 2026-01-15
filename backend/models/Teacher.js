const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const teacherSchema = new mongoose.Schema({
  teacherId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  }, // Default password set by admin, changed later
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  classConfig: {
    type: String, // e.g., "10A"
    trim: true,
  },
  profileImage: {
    type: String,
  },
  isSuspended: { type: Boolean, default: false },
  isTerminated: { type: Boolean, default: false },
  role: { type: String, default: 'Teacher' }
});

teacherSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

teacherSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const Teacher = mongoose.model('Teacher', teacherSchema);
module.exports = Teacher;
