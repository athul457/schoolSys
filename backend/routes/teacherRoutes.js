const express = require('express');
const router = express.Router();
const { protect, teacherOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
    getMyExams,
    createExam,
    updateExam,
    deleteExam,
    getStudents,
    addStudent,
    toggleStudentSuspend,
    addResult,
    updateProfile,
    getExamResults
} = require('../controllers/teacherController');

router.get('/exams', protect, teacherOnly, getMyExams);
router.post('/exams', protect, teacherOnly, createExam);
router.put('/exams/:id', protect, teacherOnly, updateExam);
router.delete('/exams/:id', protect, teacherOnly, deleteExam);
router.get('/exams/:id/results', protect, teacherOnly, getExamResults);

router.put('/profile', protect, teacherOnly, upload.single('image'), updateProfile);

router.get('/students', protect, teacherOnly, getStudents);
router.post('/students', protect, teacherOnly, addStudent);
router.put('/students/suspend/:id', protect, teacherOnly, toggleStudentSuspend);
router.post('/results', protect, teacherOnly, addResult);

module.exports = router;
