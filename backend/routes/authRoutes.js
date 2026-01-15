const express = require('express');
const router = express.Router();
const { registerAdmin, loginUser } = require('../controllers/authController');

router.post('/register-admin', registerAdmin);
router.post('/login', loginUser);

module.exports = router;
