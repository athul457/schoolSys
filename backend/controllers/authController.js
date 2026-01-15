const Admin = require('../models/Admin');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const generateToken = require('../utils/generateToken');

// @desc    Register a new Admin (Initial or additional)
// @route   POST /api/auth/register-admin
// @access  Public (or Protected later)
const registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await Admin.findOne({ email });

  if (userExists) {
    res.status(400).json({ message: 'Admin already exists' });
    return;
  }

  const user = await Admin.create({
    name,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
      role: 'Admin'
    });
  } else {
    res.status(400).json({ message: 'Invalid admin data' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password, role } = req.body; 
  console.log(`Login attempt: email=${email}, role=${role}`);

  let user;
  
  if (role === 'Admin') {
      user = await Admin.findOne({ email });
  } else if (role === 'Teacher') {
      user = await Teacher.findOne({ email }); 
  } else if (role === 'Student') {
      user = await Student.findOne({ email }); 
  } else {
      res.status(400).json({ message: 'Invalid role selected' });
      return;
  }

  console.log('User found:', user ? 'Yes' : 'No');

  if (user && (await user.matchPassword(password))) {
    console.log('Password match: Success');
    if (user.isSuspended) {
        res.status(403).json({ message: 'Your account is suspended. Contact Admin.' });
        return;
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: role,
      token: generateToken(user._id),
    });
  } else {
    console.log('Password match: Failed');
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

module.exports = { registerAdmin, loginUser };
