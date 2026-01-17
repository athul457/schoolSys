const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Exam = require('../models/Exam');
const Admin = require('../models/Admin');

// @desc    Add a Teacher
// @route   POST /api/admin/teachers
// @access  Private/Admin
// @desc    Update Teacher Details (e.g. Assign Class)
// @route   PUT /api/admin/teachers/:id
// @access  Private/Admin
const updateTeacher = async (req, res) => {
    try {
        const { name, email, subject, classConfig } = req.body;
        const teacher = await Teacher.findById(req.params.id);

        if (teacher) {
            teacher.name = name || teacher.name;
            teacher.email = email || teacher.email;
            teacher.subject = subject || teacher.subject;
            teacher.classConfig = classConfig || teacher.classConfig;

            const updatedTeacher = await teacher.save();
            res.json(updatedTeacher);
        } else {
            res.status(404).json({ message: 'Teacher not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a Teacher
// @route   POST /api/admin/teachers
// @access  Private/Admin
const addTeacher = async (req, res) => {
    try {
        let { teacherId, name, email, subject, classConfig } = req.body;
        
        // Trim inputs
        teacherId = teacherId.trim();
        email = email.trim().toLowerCase();
        
        const teacherExists = await Teacher.findOne({ teacherId });
        if (teacherExists) {
            return res.status(400).json({ message: 'Teacher ID already exists' });
        }

        // Requirement: Password is teacherId
        const teacher = await Teacher.create({
            teacherId, 
            name, 
            email, 
            password: teacherId, 
            subject, 
            classConfig
        });

        res.status(201).json(teacher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a Student
// @route   POST /api/admin/students
// @access  Private/Admin
const addStudent = async (req, res) => {
    try {
        const { studentId, name, email, password, class: studentClass, section } = req.body;

        const studentExists = await Student.findOne({ studentId });
        if (studentExists) {
            return res.status(400).json({ message: 'Student ID already exists' });
        }

        const student = await Student.create({
            studentId, name, email, password, class: studentClass, section
        });

        res.status(201).json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get All Teachers
// @route   GET /api/admin/teachers
// @access  Private/Admin
const getTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find({});
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get All Students
// @route   GET /api/admin/students
// @access  Private/Admin
const getStudents = async (req, res) => {
    try {
        const students = await Student.find({});
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Suspend/Unsuspend Teacher/Student
// @route   PUT /api/admin/suspend/:type/:id
// @access  Private/Admin
const toggleSuspend = async (req, res) => {
    const { type, id } = req.params; // type: 'teacher' or 'student'

    try {
        let user;
        if (type === 'teacher') user = await Teacher.findById(id);
        if (type === 'student') user = await Student.findById(id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Toggle the status
        user.isSuspended = !user.isSuspended;
        await user.save();
        
        res.json({ 
            message: `User ${user.isSuspended ? 'suspended' : 'unsuspended'} successfully`,
            isSuspended: user.isSuspended 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get All Scheduled Exams
// @route   GET /api/admin/exams
// @access  Private/Admin
const getAllExams = async (req, res) => {
    try {
        const exams = await Exam.find({}).populate('createdBy', 'name');
        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Terminate (Hard Delete) Teacher/Student
// @route   PUT /api/admin/terminate/:type/:id
// @access  Private/Admin
const terminateUser = async (req, res) => {
    const { type, id } = req.params;

    try {
        let user;
        if (type === 'teacher') user = await Teacher.findByIdAndDelete(id);
        if (type === 'student') user = await Student.findByIdAndDelete(id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ message: 'User terminated permanently' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Admin Profile
// @route   PUT /api/admin/profile
// @access  Private/Admin
const updateAdminProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.user._id);

        if (admin) {
            admin.name = req.body.name || admin.name;
            admin.email = req.body.email || admin.email;
            
            if (req.file) {
                admin.profileImage = `/${req.file.path.replace(/\\/g, "/")}`; // Normalize path
            }
            
            const updatedAdmin = await admin.save();
            
            res.json({
                _id: updatedAdmin._id,
                name: updatedAdmin.name,
                email: updatedAdmin.email,
                role: 'Admin',
                profileImage: updatedAdmin.profileImage,
                token: req.headers.authorization.split(' ')[1] 
            });
        } else {
            res.status(404).json({ message: 'Admin not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addTeacher, updateTeacher, addStudent, getTeachers, getStudents, toggleSuspend, terminateUser, getAllExams, updateAdminProfile };
