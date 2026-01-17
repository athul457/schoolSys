const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.SECRETE_ACCESS_KEY);

      // Check all collections
      let user = await Admin.findById(decoded.id).select('-password');
      if (!user) {
         user = await Teacher.findById(decoded.id).select('-password');
      }
      if (!user) {
         user = await Student.findById(decoded.id).select('-password');
      }

      req.user = user;
      
      // Check for suspension
      if (user.isSuspended) {
          return res.status(403).json({ message: 'Account suspended' });
      }

      // Attach role for easier access control
      if (user instanceof Admin) req.user.role = 'Admin';
      // Teacher/Student models already have role field, but fallback if not
      else if (!req.user.role) { 
         // logic to determine role if needed, but Models have 'role' schema default
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'Admin' || req.user instanceof Admin)) { // checking instance as backup
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

const teacherOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'Teacher' || req.user.teacherId)) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as a teacher' });
    }
};

module.exports = { protect, adminOnly, teacherOnly };
