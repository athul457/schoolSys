const Student = require('../models/Student');
const Exam = require('../models/Exam');
const Result = require('../models/Result');

// @desc    Update Student Profile
// @route   PUT /api/student/profile
// @access  Private/Student
// @desc    Get Available Exams (for student's class)
// @route   GET /api/student/exams
// @access  Private/Student
const getAvailableExams = async (req, res) => {
    try {
        const student = await Student.findById(req.user._id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // Fetch exams for the student's class
        // Optional: Filter by date (e.g., date >= today)
        const exams = await Exam.find({ class: student.class })
            .select('-questions.correctAnswer') // Don't send correct answers to frontend!
            .populate('createdBy', 'name');

        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit Exam
// @route   POST /api/student/exam/:id
// @access  Private/Student
const submitExam = async (req, res) => {
    try {
        const { answers } = req.body; // Object: { questionId: selectedOption, ... } OR Array of indices
        // Assuming answers is: { "questionId_or_index": "Selected Option String" }
        // Simplify: Let's assume answers is an array matching the questions order for now, or use index.
        // Better: client sends array of selected options matching questions array.

        const exam = await Exam.findById(req.params.id);
        if (!exam) return res.status(404).json({ message: 'Exam not found' });

        // Check if already taken
        const existingResult = await Result.findOne({ exam: exam._id, student: req.user._id });
        if (existingResult) {
            return res.status(400).json({ message: 'You have already taken this exam' });
        }

        let score = 0;
        const totalQuestions = exam.questions.length;
        
        // Calculate Score
        // Expecting req.body.answers to be an array of strings (selected options)
        // matching the order of exam.questions
        const studentAnswers = req.body.answers || [];

        exam.questions.forEach((q, index) => {
            if (studentAnswers[index] === q.correctAnswer) {
                // Marks per question = Full Marks / Total Questions? 
                // Or simplistic: 1 mark per question?
                // Let's assume equal distribution for now
                score += (exam.fullMarks / totalQuestions);
            }
        });

        // Create Result
        const result = await Result.create({
            exam: exam._id,
            student: req.user._id,
            marksObtained: Math.round(score) // Round to nearest integer
        });

        res.status(201).json({ 
            message: 'Exam submitted successfully', 
            score: Math.round(score),
            total: exam.fullMarks,
            passed: Math.round(score) >= exam.passMarks
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Student Results
// @route   GET /api/student/results
// @access  Private/Student
const getMyResults = async (req, res) => {
    try {
        const results = await Result.find({ student: req.user._id })
            .populate('exam', 'name date subject fullMarks passMarks');
        
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const student = await Student.findById(req.user._id);

        if (student) {
            student.name = req.body.name || student.name;
            student.email = req.body.email || student.email;
            
            if (req.file) {
                student.profileImage = `/${req.file.path.replace(/\\/g, "/")}`; // Normalize path
            }

            const updatedStudent = await student.save();
            
            res.json({
                _id: updatedStudent._id,
                name: updatedStudent.name,
                email: updatedStudent.email,
                role: updatedStudent.role,
                studentId: updatedStudent.studentId,
                class: updatedStudent.class,
                section: updatedStudent.section,
                profileImage: updatedStudent.profileImage,
                token: req.headers.authorization.split(' ')[1] 
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { updateProfile, getAvailableExams, submitExam, getMyResults };
