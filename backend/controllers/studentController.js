const Student = require('../models/Student');
const Exam = require('../models/Exam');
const Result = require('../models/Result');
const Note = require('../models/Note');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// @desc    Generate Study Notes
// @route   POST /api/student/generate-notes
// @access  Private/Student
const generateNotes = async (req, res) => {
    try {
        const { topic, subject } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ message: "Gemini API Key is not configured" });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `Generate detailed, easy-to-understand study notes for a school student on the topic "${topic}" for the subject "${subject}". 
        Include:
        1. Key Concepts (Bullet points)
        2. Important Definitions
        3. Real-world Examples
        4. Summary
        
        Format the output in clear Markdown.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ notes: text });

    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ message: "AI Error: " + (error.message || "Failed to generate notes") });
    }
};

// @desc    Ask a Question about the Topic
// @route   POST /api/student/ask-question
// @access  Private/Student
const askQuestion = async (req, res) => {
    try {
        const { topic, subject, question } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ message: "Gemini API Key is not configured" });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
        Context: The student is studying "${topic}" in the subject "${subject}".
        Question: ${question}
        
        Provide a clear, concise, and helpful answer suitable for a school student.
        Format the answer in Markdown.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ answer: text });

    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ message: "AI Error: " + (error.message || "Failed to get answer") });
    }
};

// @desc    Save Study Note
// @route   POST /api/student/save-note
// @access  Private/Student
const saveNote = async (req, res) => {
    try {
        const { topic, subject, content } = req.body;
        
        const note = await Note.create({
            studentId: req.user._id,
            topic,
            subject,
            content
        });

        res.status(201).json(note);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to save note" });
    }
};

// @desc    Get Saved Notes
// @route   GET /api/student/saved-notes
// @access  Private/Student
const getSavedNotes = async (req, res) => {
    try {
        const notes = await Note.find({ studentId: req.user._id }).sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to load notes" });
    }
};

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

        // Fetch all results for this student to know which exams are attempted
        const attemptedExams = await Result.find({ student: req.user._id }).select('exam');
        const attemptedExamIds = attemptedExams.map(result => result.exam.toString());

        // Fetch exams for the student's class
        const exams = await Exam.find({ class: student.class })
            .select('-questions.correctAnswer')
            .populate('createdBy', 'name');

        // Filter out exams that are already attempted
        const availableExams = exams.filter(exam => !attemptedExamIds.includes(exam._id.toString()));

        res.json(availableExams);
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

module.exports = { updateProfile, getAvailableExams, submitExam, getMyResults, generateNotes, askQuestion, saveNote, getSavedNotes };
