const Exam = require('../models/Exam');
const Student = require('../models/Student');
const Result = require('../models/Result');
const Teacher = require('../models/Teacher');

// @desc    Get Teacher's Exams
// @route   GET /api/teacher/exams
// @access  Private/Teacher
const getMyExams = async (req, res) => {
    try {
        const exams = await Exam.find({ createdBy: req.user._id });
        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create Exam
// @route   POST /api/teacher/exams
// @access  Private/Teacher
const createExam = async (req, res) => {
    try {
        const { name, date, subject, class: examClass, fullMarks, passMarks, questions } = req.body;
        
        const exam = await Exam.create({
            name,
            date,
            subject,
            class: examClass,
            fullMarks,
            passMarks,
            questions, // Array of { questionText, options, correctAnswer }
            createdBy: req.user._id
        });

        res.status(201).json(exam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Exam
// @route   PUT /api/teacher/exams/:id
// @access  Private/Teacher
const updateExam = async (req, res) => {
    try {
        const { name, date, subject, class: examClass, fullMarks, passMarks, questions } = req.body;
        const exam = await Exam.findById(req.params.id);

        if (exam) {
            // Check ownership
            if (exam.createdBy.toString() !== req.user._id.toString()) {
                 return res.status(401).json({ message: 'Not authorized' });
            }

            exam.name = name || exam.name;
            exam.date = date || exam.date;
            exam.subject = subject || exam.subject;
            exam.class = examClass || exam.class;
            exam.fullMarks = fullMarks || exam.fullMarks;
            exam.passMarks = passMarks || exam.passMarks;
            exam.questions = questions || exam.questions;

            const updatedExam = await exam.save();
            res.json(updatedExam);
        } else {
            res.status(404).json({ message: 'Exam not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete Exam
// @route   DELETE /api/teacher/exams/:id
// @access  Private/Teacher
const deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (exam) {
             // Check ownership
            if (exam.createdBy.toString() !== req.user._id.toString()) {
                 return res.status(401).json({ message: 'Not authorized' });
            }
            
            await Exam.deleteOne({ _id: req.params.id });
            res.json({ message: 'Exam removed' });
        } else {
            res.status(404).json({ message: 'Exam not found' });
        }
    } catch (error) {
         res.status(500).json({ message: error.message });
    }
};

// @desc    Add a Student
// @route   POST /api/teacher/students
// @access  Private/Teacher
const addStudent = async (req, res) => {
    try {
        let { studentId, name, email, class: studentClass, section } = req.body;
        
         // Trim
        studentId = studentId.trim();
        email = email.trim().toLowerCase();

        const studentExists = await Student.findOne({ studentId });
        if (studentExists) {
            return res.status(400).json({ message: 'Student ID already exists' });
        }

        const student = await Student.create({
            studentId,
            name,
            email,
            password: studentId, // Password is studentId
            class: studentClass,
            section
        });

        res.status(201).json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Suspend/Unsuspend Student
// @route   PUT /api/teacher/students/suspend/:id
// @access  Private/Teacher
const toggleStudentSuspend = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (student) {
            student.isSuspended = !student.isSuspended;
            await student.save();
            res.json({ message: `Student ${student.isSuspended ? 'suspended' : 'active'}` });
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Publish Result
// @route   POST /api/teacher/results
// @access  Private/Teacher
const addResult = async (req, res) => {
    try {
        const { examId, studentId, marks } = req.body;
        
        // Update if exists, else create
        let result = await Result.findOne({ exam: examId, student: studentId });

        if (result) {
            result.marksObtained = marks;
            await result.save();
        } else {
            result = await Result.create({
                exam: examId,
                student: studentId,
                marksObtained: marks
            });
        }
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Students
// @route   GET /api/teacher/students
// @access  Private/Teacher
const getStudents = async (req, res) => {
    try {
        const { suspended } = req.query;
        const filter = { isTerminated: false };
        
        if (suspended === 'true') {
            filter.isSuspended = true;
        } else if (suspended === 'false') {
             filter.isSuspended = false;
        }
        
        const students = await Student.find(filter);
        res.json(students);
    } catch (error) {
         res.status(500).json({ message: error.message });
    }
}


// @desc    Update Teacher Profile
// @route   PUT /api/teacher/profile
// @access  Private/Teacher
const updateProfile = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.user._id);

        if (teacher) {
            teacher.name = req.body.name || teacher.name;
            teacher.email = req.body.email || teacher.email;
            
            if (req.file) {
                teacher.profileImage = `/${req.file.path.replace(/\\/g, "/")}`; // Normalize path
            }

            // If email is being changed, check uniqueness could be added here via index error handling
            
            const updatedTeacher = await teacher.save();
            
            res.json({
                _id: updatedTeacher._id,
                name: updatedTeacher.name,
                email: updatedTeacher.email,
                role: updatedTeacher.role,
                teacherId: updatedTeacher.teacherId,
                classConfig: updatedTeacher.classConfig,
                subject: updatedTeacher.subject,
                profileImage: updatedTeacher.profileImage,
                token: req.headers.authorization.split(' ')[1] // Return existing token
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Exam Results
// @route   GET /api/teacher/exams/:id/results
// @access  Private/Teacher
const getExamResults = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        // Check ownership? Optional, but good practice.
        if (exam.createdBy.toString() !== req.user._id.toString()) {
             return res.status(401).json({ message: 'Not authorized to view these results' });
        }

        const results = await Result.find({ exam: req.params.id })
            .populate('student', 'name email studentId')
            .populate('exam', 'passMarks fullMarks')
            .sort('-marksObtained'); // Sort by marks descending

        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getMyExams, createExam, updateExam, deleteExam, getStudents, addStudent, toggleStudentSuspend, addResult, updateProfile, getExamResults };
