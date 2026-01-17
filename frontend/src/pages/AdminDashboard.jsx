import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChalkboardTeacher, FaUserGraduate, FaClipboardList, FaUserPlus, FaBan, FaTrash, FaCheck } from 'react-icons/fa';
import DashboardNavbar from '../components/DashboardNavbar';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('teachers'); // teachers, students, exams
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form states
    const [showAddForm, setShowAddForm] = useState(false);
    
    // Fetch data
    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'teachers') {
                const { data } = await axios.get('/admin/teachers');
                setTeachers(Array.isArray(data) ? data : []);
            } else if (activeTab === 'students') {
                const { data } = await axios.get('/admin/students');
                setStudents(Array.isArray(data) ? data : []);
            } else if (activeTab === 'exams') {
                const { data } = await axios.get('/admin/exams');
                setExams(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            toast.error('Failed to fetch data');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const handleSuspend = async (type, id) => {
        try {
            const { data } = await axios.put(`/admin/suspend/${type}/${id}`);
            toast.success(data.message);
            fetchData();
        } catch (error) {
            console.error('Suspend Error:', error);
            const msg = error.response?.data?.message || error.message || 'Action failed';
            toast.error(msg);
        }
    };

    const handleTerminate = async (type, id) => {
        if (!window.confirm('Are you sure you want to PERMANENTLY terminate this user? This action CANNOT be undone.')) return;
        try {
            await axios.put(`/admin/terminate/${type}/${id}`);
            toast.success('User terminated globally');
            fetchData();
        } catch (error) {
            console.error('Terminate Error:', error);
            const msg = error.response?.data?.message || error.message || 'Termination failed';
            toast.error(msg);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20 px-4 sm:px-6 lg:px-8">
            <DashboardNavbar />
            <div className="max-w-7xl mx-auto pt-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
                

                {/* Tabs */}
                <div className="flex space-x-4 mb-8 bg-white p-2 rounded-xl shadow-sm w-fit">
                    <button 
                        onClick={() => setActiveTab('teachers')}
                        className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'teachers' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <FaChalkboardTeacher /> <span>Teachers</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('students')}
                        className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'students' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <FaUserGraduate /> <span>Students</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('exams')}
                        className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'exams' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <FaClipboardList /> <span>Exams</span>
                    </button>
                </div>

                {/* Content */}
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'teachers' && (
                            <TeachersSection 
                                teachers={teachers} 
                                loading={loading} 
                                onRefresh={fetchData} 
                                onSuspend={handleSuspend} 
                                onTerminate={handleTerminate} 
                            />
                        )}
                        {activeTab === 'students' && (
                            <StudentsSection 
                                students={students} 
                                loading={loading} 
                                onRefresh={fetchData} 
                                onSuspend={handleSuspend} 
                                onTerminate={handleTerminate} 
                            />
                        )}
                        {activeTab === 'exams' && (
                            <ExamsSection exams={exams} loading={loading} />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

// Sub-components (could be separate files, keeping here for simplicity first)

const TeachersSection = ({ teachers, loading, onRefresh, onSuspend, onTerminate }) => {
    const [modalConfig, setModalConfig] = useState({ show: false, mode: 'add', data: null });
    const [viewMode, setViewMode] = useState('active'); // 'active' or 'suspended'

    const handleEdit = (teacher) => {
        setModalConfig({ show: true, mode: 'edit', data: teacher });
    };

    const handleAdd = () => {
        setModalConfig({ show: true, mode: 'add', data: null });
    };

    // Filter teachers based on view mode
    const teacherList = Array.isArray(teachers) ? teachers : [];
    const filteredTeachers = teacherList.filter(t => 
        viewMode === 'active' ? !t.isSuspended : t.isSuspended
    );

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex items-center space-x-4">
                    <h2 className="text-xl font-bold text-gray-800">Manage Teachers</h2>
                    <div className="flex bg-gray-200 p-1 rounded-lg">
                        <button 
                            onClick={() => setViewMode('active')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'active' ? 'bg-white shadow text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            Active
                        </button>
                        <button 
                            onClick={() => setViewMode('suspended')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'suspended' ? 'bg-white shadow text-red-700' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            Suspended
                        </button>
                    </div>
                </div>
                <button 
                    onClick={handleAdd}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
                >
                    <FaUserPlus /> <span>Add Teacher</span>
                </button>
            </div>

            {loading ? <p>Loading...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTeachers.map(teacher => (
                        <UserCard 
                            key={teacher._id} 
                            user={teacher} 
                            type="teacher" 
                            onSuspend={onSuspend} 
                            onTerminate={onTerminate} 
                            onEdit={() => handleEdit(teacher)}
                        />
                    ))}
                    {filteredTeachers.length === 0 && (
                        <p className="text-gray-500 italic">No {viewMode} teachers found.</p>
                    )}
                </div>
            )}
            
            {modalConfig.show && (
                <UserModal 
                    type="teacher" 
                    mode={modalConfig.mode}
                    initialData={modalConfig.data}
                    onClose={() => setModalConfig({ ...modalConfig, show: false })} 
                    onRefresh={onRefresh} 
                />
            )}
        </div>
    );
};

const StudentsSection = ({ students, loading, onRefresh, onSuspend, onTerminate }) => {
    const [showModal, setShowModal] = useState(false);
    const [viewMode, setViewMode] = useState('active'); // 'active' or 'suspended'

    // Filter students based on view mode
    const studentList = Array.isArray(students) ? students : [];
    const filteredStudents = studentList.filter(s => 
        viewMode === 'active' ? !s.isSuspended : s.isSuspended
    );

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                 <div className="flex items-center space-x-4">
                    <h2 className="text-xl font-bold text-gray-800">Manage Students</h2>
                    <div className="flex bg-gray-200 p-1 rounded-lg">
                        <button 
                            onClick={() => setViewMode('active')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'active' ? 'bg-white shadow text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            Active
                        </button>
                        <button 
                            onClick={() => setViewMode('suspended')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'suspended' ? 'bg-white shadow text-red-700' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            Suspended
                        </button>
                    </div>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
                >
                    <FaUserPlus /> <span>Add Student</span>
                </button>
            </div>

            {loading ? <p>Loading...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStudents.map(student => (
                        <UserCard 
                            key={student._id} 
                            user={student} 
                            type="student" 
                            onSuspend={onSuspend} 
                            onTerminate={onTerminate} 
                        />
                    ))}
                    {filteredStudents.length === 0 && <p className="text-gray-500 italic">No {viewMode} students found.</p>}
                </div>
            )}

            {showModal && <UserModal type="student" mode="add" onClose={() => setShowModal(false)} onRefresh={onRefresh} />}
        </div>
    );
};

const ExamsSection = ({ exams, loading }) => {
    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Scheduled Exams</h2>
            {loading ? <p>Loading...</p> : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {exams.map(exam => (
                                <tr key={exam._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exam.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.subject}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.class}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(exam.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.createdBy?.name || 'Unknown'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {exams.length === 0 && <p className="p-6 text-center text-gray-500">No exams scheduled.</p>}
                </div>
            )}
        </div>
    );
};

const UserCard = ({ user, type, onSuspend, onTerminate, onEdit }) => {
    const isSuspended = user.isSuspended;

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-lg text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-400 mt-1">ID: {type === 'teacher' ? user.teacherId : user.studentId}</p>
                </div>
                {isSuspended && <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded">Suspended</span>}
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                {type === 'teacher' && <span>Subject: {user.subject}</span>}
                {type === 'teacher' && <span>Class: {user.classConfig}</span>}
                {type === 'student' && <span>Class: {user.class} {user.section}</span>}
            </div>

            <div className="space-y-2">
                    <div className="flex space-x-2">
                    <button 
                        onClick={(e) => {
                            e.preventDefault();
                            onSuspend(type, user._id);
                        }}
                        className={`flex-1 py-1.5 rounded text-sm font-medium transition-colors ${isSuspended ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        {isSuspended ? 'Unsuspend' : 'Suspend'}
                    </button>
                    <button 
                        onClick={() => onTerminate(type, user._id)}
                        className="flex-1 py-1.5 rounded text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                        Terminate
                    </button>
                </div>
                {onEdit && (
                        <button 
                        onClick={onEdit}
                        className="w-full py-1.5 rounded text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        >
                        Edit Details
                        </button>
                )}
            </div>
        </div>
    );
};

const UserModal = ({ type, mode = 'add', initialData, onClose, onRefresh }) => {
    const [formData, setFormData] = useState(initialData || {});

    useEffect(() => {
        if (mode === 'edit' && initialData) {
            setFormData(initialData);
        }
    }, [mode, initialData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'add') {
                const url = type === 'teacher' ? '/admin/teachers' : '/admin/students';
                await axios.post(url, formData);
                toast.success(`${type} added successfully`);
            } else {
                const url = type === 'teacher' ? `/admin/teachers/${initialData._id}` : `/admin/students/${initialData._id}`;
                await axios.put(url, formData);
                toast.success(`${type} updated successfully`);
            }
            onRefresh();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
            >
                <h3 className="text-2xl font-bold mb-6">{mode === 'add' ? 'Add New' : 'Edit'} {type === 'teacher' ? 'Teacher' : 'Student'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" placeholder="Name" required value={formData.name || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                    <input name="email" type="email" placeholder="Email" required value={formData.email || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                    {type === 'student' && mode === 'add' && <input name="password" type="text" placeholder="Default Password" required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />}
                    
                    {type === 'teacher' && (
                        <>
                            <input name="teacherId" placeholder="Teacher ID" required disabled={mode === 'edit'} value={formData.teacherId || ''} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg ${mode === 'edit' ? 'bg-gray-100' : ''}`} />
                            <input name="subject" placeholder="Subject" required value={formData.subject || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                            <input name="classConfig" placeholder="Class Config (e.g. 10A)" value={formData.classConfig || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                        </>
                    )}
                    
                    {type === 'student' && (
                        <>
                            <input name="studentId" placeholder="Student ID" required disabled={mode === 'edit'} value={formData.studentId || ''} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg ${mode === 'edit' ? 'bg-gray-100' : ''}`} />
                            <input name="class" placeholder="Class" required value={formData.class || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                            <input name="section" placeholder="Section" value={formData.section || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                        </>
                    )}

                    <div className="flex space-x-3 mt-6">
                        <button type="button" onClick={onClose} className="flex-1 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                        <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{mode === 'add' ? 'Add' : 'Update'} {type}</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default AdminDashboard;
