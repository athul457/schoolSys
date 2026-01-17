const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Student doesn't need special role check, just protection
const upload = require('../middleware/uploadMiddleware');
const { updateProfile, getAvailableExams, submitExam, getMyResults, generateNotes, askQuestion, saveNote, getSavedNotes } = require('../controllers/studentController');

router.put('/profile', protect, upload.single('image'), updateProfile);
router.get('/exams', protect, getAvailableExams);
router.post('/exam/:id', protect, submitExam);
router.get('/results', protect, getMyResults);
router.post('/generate-notes', protect, generateNotes);
router.post('/ask-question', protect, askQuestion);
router.post('/save-note', protect, saveNote);
router.get('/saved-notes', protect, getSavedNotes);

module.exports = router;
