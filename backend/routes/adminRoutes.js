const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { addTeacher, updateTeacher, addStudent, getTeachers, getStudents, toggleSuspend, terminateUser, getAllExams, updateAdminProfile } = require('../controllers/adminController');

router.post('/teachers', protect, adminOnly, addTeacher);
router.get('/teachers', protect, adminOnly, getTeachers);
router.put('/teachers/:id', protect, adminOnly, updateTeacher);

router.post('/students', protect, adminOnly, addStudent);
router.get('/students', protect, adminOnly, getStudents);

router.get('/exams', protect, adminOnly, getAllExams);

router.put('/suspend/:type/:id', protect, adminOnly, toggleSuspend);
router.put('/terminate/:type/:id', protect, adminOnly, terminateUser);

router.put('/profile', protect, adminOnly, upload.single('image'), updateAdminProfile);

module.exports = router;
