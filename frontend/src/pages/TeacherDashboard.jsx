import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaClipboardList, FaPlus, FaUsers, FaUserSlash, FaUserCheck, FaUserPlus, FaTrash, FaPen, FaEye, FaSearch, FaTimes } from 'react-icons/fa';
import DashboardNavbar from '../components/DashboardNavbar';

const StatsCard = ({ title, count, icon: Icon, color }) => (
    <motion.div 
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/50 flex items-center justify-between relative overflow-hidden group hover:shadow-2xl transition-all duration-300"
   >
       <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-${color}-500/20 transition-all`}></div>
       
       <div>
           <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">{title}</p>
           <h3 className="text-4xl font-black text-gray-800 mt-1">{count}</h3>
       </div>
       <div className={`p-4 bg-${color}-100 text-${color}-600 rounded-2xl shadow-inner group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={28} />
       </div>
   </motion.div>
);

const TeacherDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('exams'); // exams, students, suspended
    const [exams, setExams] = useState([]);
    const [students, setStudents] = useState([]);
    const [stats, setStats] = useState({ exams: 0, students: 0, suspended: 0 });
    const [loading, setLoading] = useState(false);
    
    // Modals
    const [examModalConfig, setExamModalConfig] = useState({ show: false, mode: 'add', data: null });
    const [showStudentModal, setShowStudentModal] = useState(false);
    
    // Selected for actions
    const [selectedExam, setSelectedExam] = useState(null);

    // Results Modal specific
    const [showResultsModal, setShowResultsModal] = useState(false);
    const [selectedExamResults, setSelectedExamResults] = useState(null);
    const [loadingResults, setLoadingResults] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch stats if possible or derive from separate calls
            // For now, we will just fetch the data for the active tab to keep it efficient, 
            // but to show stats we might need lighter endpoints or just cache locally.
            // Let's fetch all quickly for the stats counters for a premium feel.
            
            const [examsRes, studentsRes, suspendedRes] = await Promise.all([
                axios.get('/teacher/exams'),
                axios.get('/teacher/students?suspended=false'),
                axios.get('/teacher/students?suspended=true')
            ]);

            setStats({
                exams: examsRes.data?.length || 0,
                students: studentsRes.data?.length || 0,
                suspended: suspendedRes.data?.length || 0
            });

            if (activeTab === 'exams') {
                setExams(examsRes.data);
                // setStudents(studentsRes.data); // Potentially needed for results dropdown
            } else if (activeTab === 'students') {
                setStudents(studentsRes.data);
            } else if (activeTab === 'suspended') {
                setStudents(suspendedRes.data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to sync data');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

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

    // Derived state for searching
    const [searchTerm, setSearchTerm] = useState('');
    const filteredContent = activeTab === 'exams' 
        ? exams.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.studentId.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 pt-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
             {/* Background Shapes */}
             <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
            </div>

            <DashboardNavbar />
            
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Teacher Dashboard</h1>
                    <p className="text-gray-500 mt-2 font-medium">Manage your exams and students effectively.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <StatsCard title="My Exams" count={stats.exams} icon={FaClipboardList} color="amber" />
                    <StatsCard title="Active Students" count={stats.students} icon={FaUsers} color="orange" />
                    <StatsCard title="Suspended" count={stats.suspended} icon={FaUserSlash} color="red" />
                </div>

                {/* Tabs & Controls */}
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
                    <div className="flex bg-white/60 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-white/50 overflow-x-auto max-w-full">
                        <button 
                            onClick={() => setActiveTab('exams')}
                            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'exams' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' : 'text-gray-600 hover:bg-white/50 hover:text-amber-600'}`}
                        >
                            <FaClipboardList /> <span>Exams</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('students')}
                            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'students' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' : 'text-gray-600 hover:bg-white/50 hover:text-amber-600'}`}
                        >
                            <FaUsers /> <span>Students</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('suspended')}
                            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'suspended' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg' : 'text-gray-600 hover:bg-white/50 hover:text-red-600'}`}
                        >
                            <FaUserSlash /> <span>Suspended</span>
                        </button>
                    </div>

                     <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative group w-full md:w-64 focus-within:w-72 transition-all duration-300">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                className="block w-full pl-10 pr-10 py-3 bg-white/60 border border-white/50 rounded-xl leading-5 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-300 shadow-sm hover:shadow-md"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button 
                                    onClick={() => setSearchTerm('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes />
                                </button>
                            )}
                        </div>
                        {activeTab === 'exams' && (
                             <button 
                                onClick={handleAddExam}
                                className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-5 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all font-bold whitespace-nowrap"
                            >
                                <FaPlus /> <span>Create Exam</span>
                            </button>
                        )}
                         {activeTab === 'students' && (
                             <button 
                                onClick={() => setShowStudentModal(true)}
                                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all font-bold whitespace-nowrap"
                            >
                                <FaUserPlus /> <span>Add Student</span>
                            </button>
                        )}
                    </div>
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
                             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                 {filteredContent.map(exam => (
                                     <ExamCard 
                                        key={exam._id} 
                                        exam={exam} 
                                        onEdit={() => handleEditExam(exam)} 
                                        onDelete={() => handleDeleteExam(exam._id)}
                                        onViewResults={() => handleViewResults(exam._id, exam.name)}
                                    />
                                 ))}
                                 {filteredContent.length === 0 && <EmptyState message="No exams found." icon={FaClipboardList} />}
                             </div>
                         )}

                         {(activeTab === 'students' || activeTab === 'suspended') && (
                             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                 {filteredContent.map(student => (
                                     <StudentCard 
                                        key={student._id} 
                                        student={student} 
                                        onSuspendToggle={handleSuspendToggle} 
                                    />
                                 ))}
                                 {filteredContent.length === 0 && <EmptyState message={`No ${activeTab} students found.`} icon={FaUsers} />}
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
                
                {/* View Results Modal */}
                <AnimatePresence>
                    {showResultsModal && (
                        <ViewResultsModal 
                            results={selectedExamResults} 
                            loading={loadingResults} 
                            onClose={() => setShowResultsModal(false)} 
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const EmptyState = ({ message, icon: Icon }) => (
    <div className="col-span-full py-16 text-center">
        <div className="inline-block p-6 bg-white/50 backdrop-blur-sm rounded-full mb-4 border border-white/60 shadow-lg">
            <Icon className="text-gray-300 text-5xl" />
        </div>
        <p className="text-gray-500 font-bold text-lg">{message}</p>
    </div>
);

const ExamCard = ({ exam, onEdit, onDelete, onViewResults }) => (
    <div className="group bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:bg-amber-500/20"></div>
        
        <div className="mb-4">
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-extrabold uppercase tracking-wide">
                {exam.subject}
            </span>
        </div>
        
        <h3 className="text-xl font-black text-gray-800 mb-2 leading-tight">{exam.name}</h3>
        
        <div className="space-y-2 mb-6 flex-1">
             <div className="flex justify-between text-sm font-medium text-gray-500 border-b border-gray-100 pb-2">
                <span>Class</span>
                <span className="text-gray-800">{exam.class}</span>
            </div>
            <div className="flex justify-between text-sm font-medium text-gray-500 border-b border-gray-100 pb-2">
                <span>Date</span>
                <span className="text-gray-800">{new Date(exam.date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-sm font-medium text-gray-500">
                <span>Marks</span>
                <span className="text-gray-800">{exam.fullMarks} (Pass: {exam.passMarks})</span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
            <button onClick={onEdit} className="py-2 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs hover:bg-blue-100 transition-colors flex items-center justify-center gap-1">
               <FaPen /> Edit
            </button>
            <button onClick={onDelete} className="py-2 rounded-xl bg-red-50 text-red-600 font-bold text-xs hover:bg-red-100 transition-colors flex items-center justify-center gap-1">
               <FaTrash /> Delete
            </button>
            <button onClick={onViewResults} className="col-span-2 py-3 rounded-xl bg-gray-800 text-white font-bold text-xs hover:bg-gray-900 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
               <FaEye /> View Results
            </button>
        </div>
    </div>
);

const StudentCard = ({ student, onSuspendToggle }) => {
    const initial = student.name?.charAt(0).toUpperCase();
    const isSuspended = student.isSuspended;

    return (
        <div className="group relative bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
             <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl`}></div>
             
             <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg bg-gradient-to-br from-blue-400 to-indigo-600 transform group-hover:rotate-3 transition-transform">
                            {initial}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${isSuspended ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    </div>
                     <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider h-fit ${isSuspended ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {isSuspended ? 'Suspended' : 'Active'}
                    </span>
                </div>

                <div className="mb-6 flex-1">
                    <h3 className="text-xl font-extrabold text-gray-800 leading-tight mb-1 truncate">{student.name}</h3>
                    <p className="text-sm font-medium text-gray-500 mb-3 truncate">{student.email}</p>
                     <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-white/50 p-2 rounded-lg border border-white/50">
                        <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">ID: {student.studentId}</span>
                        <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Class: {student.class} {student.section}</span>
                    </div>
                </div>

                <button 
                    onClick={() => onSuspendToggle(student._id, isSuspended)}
                    className={`w-full py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wide transition-colors border shadow-sm ${isSuspended ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}
                >
                    {isSuspended ? 'Unsuspend Student' : 'Suspend Student'}
                </button>
             </div>
        </div>
    );
};

// ... Modals ...
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
            const formattedDate = initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '';
            setFormData({ ...initialData, date: formattedDate });
        }
    }, [mode, initialData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

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

    // Styling helpers
    const inputClass = "w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white/95 backdrop-blur-2xl rounded-3xl p-8 w-full max-w-3xl shadow-2xl border border-white/50 max-h-[90vh] overflow-y-auto"
            >
                <div className="flex justify-between items-center mb-6">
                    <div>
                         <h3 className="text-2xl font-black text-gray-900 tracking-tight">{mode === 'add' ? 'Create New' : 'Edit'} Exam</h3>
                         <p className="text-sm text-gray-500 font-medium">Set up exam details and questions.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full text-gray-400 transition-colors">✕</button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="name" placeholder="Exam Name" required value={formData.name} onChange={handleChange} className={inputClass} />
                        <input name="subject" placeholder="Subject" required value={formData.subject} onChange={handleChange} className={inputClass} />
                        <input name="class" placeholder="Class" required value={formData.class} onChange={handleChange} className={inputClass} />
                        <input name="date" type="date" required value={formData.date} onChange={handleChange} className={inputClass} />
                        <input name="fullMarks" type="number" placeholder="Full Marks" required value={formData.fullMarks} onChange={handleChange} className={inputClass} />
                        <input name="passMarks" type="number" placeholder="Pass Marks" required value={formData.passMarks} onChange={handleChange} className={inputClass} />
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-extrabold text-lg text-gray-800">Questions ({formData.questions?.length || 0})</h4>
                        </div>
                        
                        <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100 mb-6">
                            <input 
                                name="questionText" 
                                placeholder="Start typing your question..." 
                                value={question.questionText} 
                                onChange={handleQuestionChange} 
                                className={`${inputClass} mb-4 bg-white`} 
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                {question.options.map((opt, idx) => (
                                    <input 
                                        key={idx} 
                                        placeholder={`Option ${idx + 1}`} 
                                        value={opt} 
                                        onChange={(e) => handleOptionChange(idx, e.target.value)} 
                                        className={`${inputClass} text-sm py-2`} 
                                    />
                                ))}
                            </div>
                            <div className="mb-4">
                                <select 
                                    name="correctAnswer" 
                                    value={question.correctAnswer} 
                                    onChange={handleQuestionChange} 
                                    className={`${inputClass} bg-white`}
                                >
                                    <option value="">Select Correct Option</option>
                                    {question.options.map((opt, idx) => (
                                        opt && <option key={idx} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                            <button type="button" onClick={addQuestion} className="w-full py-3 bg-gray-900 text-white rounded-xl hover:bg-black font-bold shadow-lg transition-all">Add Question</button>
                        </div>

                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {formData.questions?.map((q, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex-1 min-w-0 mr-4">
                                        <p className="font-bold text-gray-800 truncate">{idx + 1}. {q.questionText}</p>
                                        <p className="text-xs text-green-600 font-mono mt-1">Ans: {q.correctAnswer}</p>
                                    </div>
                                    <button type="button" onClick={() => removeQuestion(idx)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition-colors">
                                        <FaTrash size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex space-x-3 pt-6 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-bold transition-colors">Cancel</button>
                        <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] font-bold transition-all shadow-md">Save Exam</button>
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
    
    const inputClass = "w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-medium";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white/95 backdrop-blur-2xl rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/50"
            >
                <div className="mb-6">
                    <h3 className="text-2xl font-black text-gray-900">Add New Student</h3>
                    <p className="text-gray-500">Enter student details below.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" placeholder="Full Name" required onChange={handleChange} className={inputClass} />
                    <input name="email" type="email" placeholder="Email Address" required onChange={handleChange} className={inputClass} />
                    <input name="studentId" placeholder="Student ID" required onChange={handleChange} className={inputClass} />
                    <div className="grid grid-cols-2 gap-4">
                        <input name="class" placeholder="Class" required onChange={handleChange} className={inputClass} />
                        <input name="section" placeholder="Section" onChange={handleChange} className={inputClass} />
                    </div>

                    <div className="flex space-x-3 mt-8">
                        <button type="button" onClick={onClose} className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-bold">Cancel</button>
                        <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg font-bold">Add Student</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const ViewResultsModal = ({ results, loading, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={e => e.stopPropagation()}
                className="bg-white/95 backdrop-blur-2xl rounded-3xl w-full max-w-4xl shadow-2xl border border-white/50 max-h-[85vh] flex flex-col overflow-hidden"
            >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900">Exam Results</h3>
                        <p className="text-blue-600 font-bold">{results?.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">✕</button>
                </div>

                <div className="p-0 overflow-y-auto flex-1 bg-white">
                    {loading ? (
                         <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                        </div>
                    ) : results?.data?.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                                <FaClipboardList className="text-gray-300 text-4xl" />
                            </div>
                            <p className="text-gray-500 font-bold">No submissions yet.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                                <tr>
                                    <th className="px-8 py-4">Student</th>
                                    <th className="px-8 py-4">ID</th>
                                    <th className="px-8 py-4">Score</th>
                                    <th className="px-8 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {results?.data.map((res) => {
                                    const passed = res.marksObtained >= (res.exam?.passMarks || 0);
                                    return (
                                        <tr key={res._id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="px-8 py-4 font-bold text-gray-900">{res.student?.name}</td>
                                            <td className="px-8 py-4 font-mono text-gray-500 text-sm">{res.student?.studentId}</td>
                                            <td className="px-8 py-4">
                                                <span className="text-2xl font-black text-gray-800">{res.marksObtained}</span>
                                                <span className="text-xs text-gray-400 ml-1">/ {res.exam?.fullMarks}</span>
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className={`px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wide ${passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                    {passed ? 'Passed' : 'Failed'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default TeacherDashboard;
