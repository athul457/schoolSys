import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaClipboardList, FaPlus, FaUsers, FaUserSlash, FaUserCheck, FaUserPlus, FaUpload, FaTrash, FaTimes } from 'react-icons/fa';
import DashboardNavbar from '../components/DashboardNavbar';

const TeacherDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('exams'); // exams, students, suspended
    const [exams, setExams] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Modals
    const [examModalConfig, setExamModalConfig] = useState({ show: false, mode: 'add', data: null });
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    
    // Selected for actions
    const [selectedExam, setSelectedExam] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'exams') {
                const { data } = await axios.get('/teacher/exams');
                setExams(data);
                // Also fetch students for dropdown in results
                const studentRes = await axios.get('/teacher/students?suspended=false');
                setStudents(studentRes.data);
            } else if (activeTab === 'students') {
                const { data } = await axios.get('/teacher/students?suspended=false');
                setStudents(data);
            } else if (activeTab === 'suspended') {
                 const { data } = await axios.get('/teacher/students?suspended=true');
                 setStudents(data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch data');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    // State for Results
    const [showResultsModal, setShowResultsModal] = useState(false);
    const [selectedExamResults, setSelectedExamResults] = useState(null);
    const [loadingResults, setLoadingResults] = useState(false);

    const handleViewResults = async (examId, examName) => {
        setLoadingResults(true);
        setSelectedExamResults({ name: examName, data: [] });
        setShowResultsModal(true);
        try {
            const { data } = await axios.get(`/teacher/exams/${examId}/results`);
            setSelectedExamResults({ name: examName, data: data });
        } catch (error) {
            console.error(error);
            toast.error('Failed to load results');
        } finally {
            setLoadingResults(false);
        }
    };

    const handleSuspendToggle = async (id, isSuspended) => {
        try {
            await axios.put(`/teacher/students/suspend/${id}`);
            toast.success(`Student ${isSuspended ? 'unsuspended' : 'suspended'}`);
            fetchData();
        } catch (error) {
            toast.error('Action failed');
        }
    };

    const handlePublishResults = (exam) => {
        setSelectedExam(exam);
        setShowResultModal(true);
    };

    const handleDeleteExam = async (id) => {
        if (!confirm('Are you sure you want to delete this exam?')) return;
        try {
            await axios.delete(`/teacher/exams/${id}`);
            toast.success('Exam deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete exam');
        }
    };

    const handleEditExam = (exam) => {
        setExamModalConfig({ show: true, mode: 'edit', data: exam });
    };

    const handleAddExam = () => {
        setExamModalConfig({ show: true, mode: 'add', data: null });
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20 px-4 sm:px-6 lg:px-8">
            <DashboardNavbar />
            <div className="max-w-7xl mx-auto pt-6">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-4 mb-8 bg-white p-2 rounded-xl shadow-sm w-fit">
                    <button 
                        onClick={() => setActiveTab('exams')}
                        className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'exams' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <FaClipboardList /> <span>My Exams</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('students')}
                        className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'students' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <FaUsers /> <span>Students</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('suspended')}
                        className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'suspended' ? 'bg-red-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <FaUserSlash /> <span>Suspended Students</span>
                    </button>
                </div>

                <AnimatePresence mode='wait'>
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                         {activeTab === 'exams' && (
                             <div>
                                 <div className="flex justify-between items-center mb-6">
                                     <h2 className="text-xl font-bold text-gray-800">Use this section to manage exams</h2>
                                     <button 
                                         onClick={handleAddExam}
                                         className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                                     >
                                         <FaPlus /> <span>Create Exam</span>
                                     </button>
                                 </div>
                                 
                                 {loading ? <p>Loading...</p> : (
                                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                         {exams.map(exam => (
                                             <div key={exam._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative">
                                                 <h3 className="font-bold text-lg text-blue-900 pr-8">{exam.name}</h3>
                                                 <p className="text-sm text-gray-600 mb-1"><span className="font-semibold">Subject:</span> {exam.subject}</p>
                                                 <p className="text-sm text-gray-600 mb-1"><span className="font-semibold">Class:</span> {exam.class}</p>
                                                 <p className="text-sm text-gray-600 mb-4"><span className="font-semibold">Date:</span> {new Date(exam.date).toLocaleDateString()}</p>
                                                 
                                                 <div className="flex space-x-2 mt-4">
                                                     <button onClick={() => handleEditExam(exam)} className="flex-1 py-1.5 border border-blue-600 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50">Edit</button>
                                                     <button onClick={() => handleDeleteExam(exam._id)} className="flex-1 py-1.5 border border-red-600 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50">Delete</button>
                                                 </div>
                                                 <button 
                                                    onClick={() => handleViewResults(exam._id, exam.name)}
                                                    className="w-full mt-2 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                                                 >
                                                     View Results
                                                 </button>
                                             </div>
                                         ))}
                                         {exams.length === 0 && <p className="text-gray-500 col-span-full text-center py-8">No exams created yet.</p>}
                                     </div>
                                 )}
                             </div>
                         )}

                         {(activeTab === 'students' || activeTab === 'suspended') && (
                             <div>
                                 <div className="flex justify-between items-center mb-6">
                                     <h2 className="text-xl font-bold text-gray-800">{activeTab === 'students' ? 'Active Students' : 'Suspended Students'}</h2>
                                     {activeTab === 'students' && (
                                         <button 
                                             onClick={() => setShowStudentModal(true)}
                                             className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
                                         >
                                             <FaUserPlus /> <span>Add Student</span>
                                         </button>
                                     )}
                                 </div>

                                 <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {students.map(student => (
                                                <tr key={student._id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.studentId}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.class} {student.section}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <button 
                                                            onClick={() => handleSuspendToggle(student._id, student.isSuspended)}
                                                            className={`flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-bold ${student.isSuspended ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                                        >
                                                            {student.isSuspended ? <><FaUserCheck /> <span>Unsuspend</span></> : <><FaUserSlash /> <span>Suspend</span></>}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {students.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No students found in this category.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                 </div>
                             </div>
                         )}
                    </motion.div>
                </AnimatePresence>

                {/* Modals */}
                {examModalConfig.show && (
                    <CreateExamModal 
                        mode={examModalConfig.mode}
                        initialData={examModalConfig.data}
                        onClose={() => setExamModalConfig({ ...examModalConfig, show: false })} 
                        onRefresh={fetchData} 
                    />
                )}
                {showStudentModal && <AddStudentModal onClose={() => setShowStudentModal(false)} onRefresh={fetchData} />}
                {showResultModal && <PublishResultModal exam={selectedExam} students={students} onClose={() => setShowResultModal(false)} />}
                
                {/* View Results Modal */}
                <AnimatePresence>
                    {showResultsModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={() => setShowResultsModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.95 }}
                                onClick={e => e.stopPropagation()}
                                className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[80vh]"
                            >
                                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Results: <span className="text-blue-600">{selectedExamResults?.name}</span>
                                    </h3>
                                    <button onClick={() => setShowResultsModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">
                                        &times;
                                    </button>
                                </div>
                                <div className="p-6 overflow-y-auto flex-1">
                                    {loadingResults ? (
                                        <div className="flex justify-center py-10"><p>Loading results...</p></div>
                                    ) : selectedExamResults?.data?.length === 0 ? (
                                        <div className="text-center py-10">
                                            <p className="text-gray-500 text-lg">No students have submitted this exam yet.</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider">
                                                    <tr>
                                                        <th className="px-6 py-3 rounded-tl-lg">Student</th>
                                                        <th className="px-6 py-3">ID</th>
                                                        <th className="px-6 py-3">Score</th>
                                                        <th className="px-6 py-3 rounded-tr-lg">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {selectedExamResults?.data.map((res) => (
                                                        <tr key={res._id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4 font-medium text-gray-900">{res.student?.name}</td>
                                                            <td className="px-6 py-4 text-gray-500 text-sm font-mono">{res.student?.studentId}</td>
                                                            <td className="px-6 py-4 text-blue-600 font-bold text-lg">{res.marksObtained}</td>
                                                            <td className="px-6 py-4">
                                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                                                    (res.marksObtained >= (res.exam?.passMarks || 0))
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'bg-red-100 text-red-700'
                                                                }`}>
                                                                    {(res.marksObtained >= (res.exam?.passMarks || 0)) ? 'Passed' : 'Failed'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 border-t bg-gray-50 flex justify-end">
                                    <button onClick={() => setShowResultsModal(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">Close</button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const CreateExamModal = ({ mode = 'add', initialData, onClose, onRefresh }) => {
    const [formData, setFormData] = useState(initialData || {
        name: '', subject: '', class: '', date: '', fullMarks: '', passMarks: '',
        questions: [] 
    });

    const [question, setQuestion] = useState({
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: ''
    });

    useEffect(() => {
        if (mode === 'edit' && initialData) {
            // Ensure date is formatted for input
            const formattedDate = initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '';
            setFormData({ ...initialData, date: formattedDate });
        }
    }, [mode, initialData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Question Handlers
    const handleQuestionChange = (e) => {
        setQuestion({ ...question, [e.target.name]: e.target.value });
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...question.options];
        newOptions[index] = value;
        setQuestion({ ...question, options: newOptions });
    };

    const addQuestion = () => {
        if (!question.questionText || !question.correctAnswer || question.options.some(o => !o)) {
            toast.error('Please fill all question fields');
            return;
        }
        setFormData({ ...formData, questions: [...(formData.questions || []), question] });
        setQuestion({ questionText: '', options: ['', '', '', ''], correctAnswer: '' });
    };

    const removeQuestion = (index) => {
        const newQuestions = [...(formData.questions || [])];
        newQuestions.splice(index, 1);
        setFormData({ ...formData, questions: newQuestions });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'add') {
                await axios.post('/teacher/exams', formData);
                toast.success('Exam created successfully');
            } else {
                 await axios.put(`/teacher/exams/${initialData._id}`, formData);
                 toast.success('Exam updated successfully');
            }
            onRefresh();
            onClose();
        } catch (error) {
            toast.error('Failed to save exam');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl my-10"
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">{mode === 'add' ? 'Create New' : 'Edit'} Exam</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">X</button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <input name="name" placeholder="Exam Name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                        <input name="subject" placeholder="Subject" required value={formData.subject} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                        <input name="class" placeholder="Class" required value={formData.class} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                        <input name="date" type="date" required value={formData.date} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                        <input name="fullMarks" type="number" placeholder="Full Marks" required value={formData.fullMarks} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                        <input name="passMarks" type="number" placeholder="Pass Marks" required value={formData.passMarks} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                    </div>

                    {/* Questions Section */}
                    <div className="border-t pt-4">
                        <h4 className="font-bold mb-4">Questions ({formData.questions?.length || 0})</h4>
                        
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <input 
                                name="questionText" 
                                placeholder="Question Text" 
                                value={question.questionText} 
                                onChange={handleQuestionChange} 
                                className="w-full px-4 py-2 border rounded-lg mb-3" 
                            />
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                {question.options.map((opt, idx) => (
                                    <input 
                                        key={idx} 
                                        placeholder={`Option ${idx + 1}`} 
                                        value={opt} 
                                        onChange={(e) => handleOptionChange(idx, e.target.value)} 
                                        className="w-full px-3 py-2 border rounded-lg text-sm" 
                                    />
                                ))}
                            </div>
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                                <select 
                                    name="correctAnswer" 
                                    value={question.correctAnswer} 
                                    onChange={handleQuestionChange} 
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="">Select Correct Option</option>
                                    {question.options.map((opt, idx) => (
                                        opt && <option key={idx} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                            <button type="button" onClick={addQuestion} className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">Add Question</button>
                        </div>

                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {formData.questions?.map((q, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-gray-100 p-2 rounded text-sm">
                                    <span className="truncate w-3/4">{idx + 1}. {q.questionText}</span>
                                    <button type="button" onClick={() => removeQuestion(idx)} className="text-red-500 hover:text-red-700">Remove</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex space-x-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="flex-1 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                        <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Exam</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const AddStudentModal = ({ onClose, onRefresh }) => {
    const [formData, setFormData] = useState({});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/teacher/students', formData);
            toast.success('Student added successfully');
            onRefresh();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add student');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
            >
                <h3 className="text-2xl font-bold mb-6">Add New Student</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" placeholder="Name" required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                    <input name="email" type="email" placeholder="Email" required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                    <input name="studentId" placeholder="Student ID" required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                    <input name="class" placeholder="Class" required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                    <input name="section" placeholder="Section" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />

                    <div className="flex space-x-3 mt-6">
                        <button type="button" onClick={onClose} className="flex-1 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                        <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add Student</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const PublishResultModal = ({ exam, students, onClose }) => {
    const [formData, setFormData] = useState({ examId: exam._id });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/teacher/results', formData);
            toast.success('Result published successfully');
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to publish result');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
            >
                <h3 className="text-2xl font-bold mb-2">Publish Results</h3>
                <p className="text-gray-500 mb-6">Exam: {exam.name} ({exam.subject})</p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
                        <select name="studentId" required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg bg-white">
                            <option value="">-- Select Student --</option>
                            {students.map(s => (
                                <option key={s._id} value={s._id}>{s.name} ({s.studentId})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Marks Obtained (Max: {exam.fullMarks})</label>
                        <input name="marks" type="number" max={exam.fullMarks} required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                    </div>

                    <div className="flex space-x-3 mt-6">
                        <button type="button" onClick={onClose} className="flex-1 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                        <button type="submit" className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Publish</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default TeacherDashboard;
