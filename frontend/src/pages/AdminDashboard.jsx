import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChalkboardTeacher, FaUserGraduate, FaClipboardList, FaUserPlus, FaBan, FaTrash, FaCheck, FaSearch, FaTimes } from 'react-icons/fa';
import DashboardNavbar from '../components/DashboardNavbar';
import { useAuth } from '../context/AuthContext';



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

const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('teachers'); 
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form states
    const [showAddForm, setShowAddForm] = useState(false);
    
    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch all data for stats if possible, or just fetch active tab. 
            // For now fetching separately based on tab, but could fetch stats summary.
            // Simplified for this demo: fetching based on tab interaction or all at once?
            // Let's fetch the relevant data for the tab, but maybe for stats we need counts.
            // Assuming the endpoints return lists.
            if (teachers.length === 0) {
                 const tRes = await axios.get('/admin/teachers');
                 setTeachers(Array.isArray(tRes.data) ? tRes.data : []);
            }
            if (students.length === 0) {
                 const sRes = await axios.get('/admin/students');
                 setStudents(Array.isArray(sRes.data) ? sRes.data : []);
            }
            if (exams.length === 0) {
                 const eRes = await axios.get('/admin/exams');
                 setExams(Array.isArray(eRes.data) ? eRes.data : []);
            }
             
            // Refetch current tab specifically to ensure fresh
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
            // Quiet fail or toast
             console.error("Fetch error", error);
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
            // Refresh specific list
            if (type === 'teacher') {
                const { data } = await axios.get('/admin/teachers');
                setTeachers(data);
            } else {
                 const { data } = await axios.get('/admin/students');
                 setStudents(data);
            }
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
            // Refresh specific list
             if (type === 'teacher') {
                const { data } = await axios.get('/admin/teachers');
                setTeachers(data);
            } else {
                 const { data } = await axios.get('/admin/students');
                 setStudents(data);
            }
        } catch (error) {
            console.error('Terminate Error:', error);
            const msg = error.response?.data?.message || error.message || 'Termination failed';
            toast.error(msg);
        }
    };

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
                     <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Dashboard Overview</h1>
                     <p className="text-gray-500 mt-2 font-medium">Welcome back, Administrator.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <StatsCard title="Total Teachers" count={teachers.length} icon={FaChalkboardTeacher} color="amber" />
                    <StatsCard title="Total Students" count={students.length} icon={FaUserGraduate} color="orange" />
                    <StatsCard title="Scheduled Exams" count={exams.length} icon={FaClipboardList} color="red" />
                </div>

                {/* Tabs */}
                <div className="flex space-x-2 mb-8 bg-white/60 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-white/50 w-fit mx-auto md:mx-0">
                    <button 
                        onClick={() => setActiveTab('teachers')}
                        className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'teachers' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' : 'text-gray-600 hover:bg-white/50 hover:text-amber-600'}`}
                    >
                        <FaChalkboardTeacher /> <span>Teachers</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('students')}
                        className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'students' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' : 'text-gray-600 hover:bg-white/50 hover:text-amber-600'}`}
                    >
                        <FaUserGraduate /> <span>Students</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('exams')}
                        className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'exams' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' : 'text-gray-600 hover:bg-white/50 hover:text-amber-600'}`}
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

const TeachersSection = ({ teachers, loading, onRefresh, onSuspend, onTerminate }) => {
    const [modalConfig, setModalConfig] = useState({ show: false, mode: 'add', data: null });
    const [viewMode, setViewMode] = useState('active'); // 'active' or 'suspended'
    const [searchTerm, setSearchTerm] = useState('');

    const handleEdit = (teacher) => {
        setModalConfig({ show: true, mode: 'edit', data: teacher });
    };

    const handleAdd = () => {
        setModalConfig({ show: true, mode: 'add', data: null });
    };

    const teacherList = Array.isArray(teachers) ? teachers : [];
    const filteredTeachers = teacherList.filter(t => {
        const matchesView = viewMode === 'active' ? !t.isSuspended : t.isSuspended;
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = t.name.toLowerCase().includes(searchLower) || 
                              t.email.toLowerCase().includes(searchLower) || 
                              t.teacherId.toLowerCase().includes(searchLower);
        return matchesView && matchesSearch;
    });

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                 {/* Filter Toggles */}
                 <div className="flex bg-white/60 backdrop-blur-md p-1.5 rounded-xl border border-white/50 shadow-sm">
                    <button 
                        onClick={() => setViewMode('active')}
                        className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'active' ? 'bg-white shadow text-amber-600' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Active
                    </button>
                    <button 
                        onClick={() => setViewMode('suspended')}
                        className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'suspended' ? 'bg-white shadow text-red-600' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Suspended
                    </button>
                </div>
                
                 {/* Search & Add */}
                 <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative group w-full sm:w-64 focus-within:w-72 transition-all duration-300">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                            className="block w-full pl-10 pr-10 py-2.5 bg-white/60 border border-white/50 rounded-xl leading-5 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-300 shadow-sm hover:shadow-md"
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
                     <button 
                        onClick={handleAdd}
                        className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all font-bold whitespace-nowrap"
                    >
                        <FaUserPlus /> <span>New Teacher</span>
                    </button>
                 </div>
            </div>

            {loading ? <p className="text-center py-10 text-gray-500">Loading...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                        <div className="col-span-full py-16 text-center">
                            <div className="inline-block p-4 bg-gray-50 rounded-full mb-4">
                                <FaChalkboardTeacher className="text-gray-300 text-4xl" />
                            </div>
                            <p className="text-gray-500 font-medium">No {viewMode} teachers found.</p>
                        </div>
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
    const [searchTerm, setSearchTerm] = useState('');

    const studentList = Array.isArray(students) ? students : [];
    const filteredStudents = studentList.filter(s => {
        const matchesView = viewMode === 'active' ? !s.isSuspended : s.isSuspended;
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = s.name.toLowerCase().includes(searchLower) || 
                              s.email.toLowerCase().includes(searchLower) || 
                              s.studentId.toLowerCase().includes(searchLower);
        return matchesView && matchesSearch;
    });

    return (
        <div>
             <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                 {/* Filter Toggles */}
                 <div className="flex bg-white/60 backdrop-blur-md p-1.5 rounded-xl border border-white/50 shadow-sm">
                    <button 
                        onClick={() => setViewMode('active')}
                        className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'active' ? 'bg-white shadow text-amber-600' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Active
                    </button>
                    <button 
                        onClick={() => setViewMode('suspended')}
                        className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'suspended' ? 'bg-white shadow text-red-600' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Suspended
                    </button>
                </div>
                
                 {/* Search & Add */}
                 <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative group w-full sm:w-64 focus-within:w-72 transition-all duration-300">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                            className="block w-full pl-10 pr-10 py-2.5 bg-white/60 border border-white/50 rounded-xl leading-5 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-300 shadow-sm hover:shadow-md"
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
                     <button 
                        onClick={() => setShowModal(true)}
                        className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all font-bold whitespace-nowrap"
                    >
                        <FaUserPlus /> <span>New Student</span>
                    </button>
                 </div>
            </div>

            {loading ? <p className="text-center py-10 text-gray-500">Loading...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredStudents.map(student => (
                        <UserCard 
                            key={student._id} 
                            user={student} 
                            type="student" 
                            onSuspend={onSuspend} 
                            onTerminate={onTerminate} 
                        />
                    ))}
                    {filteredStudents.length === 0 && (
                        <div className="col-span-full py-16 text-center">
                            <div className="inline-block p-4 bg-gray-50 rounded-full mb-4">
                                <FaUserGraduate className="text-gray-300 text-4xl" />
                            </div>
                            <p className="text-gray-500 font-medium">No {viewMode} students found.</p>
                        </div>
                    )}
                </div>
            )}

            {showModal && <UserModal type="student" mode="add" onClose={() => setShowModal(false)} onRefresh={onRefresh} />}
        </div>
    );
};

const ExamsSection = ({ exams, loading }) => {
    return (
        <div>
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Scheduled Exams</h2>
                {/* Could add a 'New Exam' button here if functionality existed */}
            </div>

            {loading ? <p className="text-center py-10 text-gray-500">Loading...</p> : (
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-white/50">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gradient-to-r from-amber-50/80 to-orange-50/80">
                            <tr>
                                <th className="px-8 py-5 text-left text-xs font-extrabold text-amber-700 uppercase tracking-wider">Exam Name</th>
                                <th className="px-8 py-5 text-left text-xs font-extrabold text-amber-700 uppercase tracking-wider">Subject</th>
                                <th className="px-8 py-5 text-left text-xs font-extrabold text-amber-700 uppercase tracking-wider">Class</th>
                                <th className="px-8 py-5 text-left text-xs font-extrabold text-amber-700 uppercase tracking-wider">Date</th>
                                <th className="px-8 py-5 text-left text-xs font-extrabold text-amber-700 uppercase tracking-wider">Created By</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white/40 divide-y divide-gray-50">
                            {exams.map(exam => (
                                <tr key={exam._id} className="hover:bg-white/80 transition-all duration-200">
                                    <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-gray-900">{exam.name}</td>
                                    <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-600 font-medium">{exam.subject}</td>
                                    <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-600">
                                        <span className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs font-bold text-gray-600">{exam.class}</span>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-600 font-medium">{new Date(exam.date).toLocaleDateString()}</td>
                                    <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500 italic">{exam.createdBy?.name || 'Unknown'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {exams.length === 0 && (
                         <div className="py-16 text-center">
                            <div className="inline-block p-4 bg-gray-50 rounded-full mb-4">
                                <FaClipboardList className="text-gray-300 text-4xl" />
                            </div>
                            <p className="text-gray-500 font-medium">No exams scheduled.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const UserCard = ({ user, type, onSuspend, onTerminate, onEdit }) => {
    const isSuspended = user.isSuspended;
    const initial = user.name?.charAt(0).toUpperCase();

    return (
        <div className="group relative bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            {/* Gradient Blob for Hover Effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${type === 'teacher' ? 'from-amber-500/5 to-orange-500/5' : 'from-blue-500/5 to-indigo-500/5'} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl`}></div>

            <div className="relative z-10 flex flex-col h-full">
                {/* Header: Avatar & Status */}
                <div className="flex justify-between items-start mb-4">
                    <div className="relative">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg transform group-hover:rotate-3 transition-transform duration-300 ${type === 'teacher' ? 'bg-gradient-to-br from-amber-400 to-orange-600' : 'bg-gradient-to-br from-blue-400 to-indigo-600'}`}>
                            {initial}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${isSuspended ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${isSuspended ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            {isSuspended ? 'Suspended' : 'Active'}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{type}</span>
                    </div>
                </div>

                {/* Info */}
                <div className="mb-6 flex-1">
                    <h3 className="text-xl font-extrabold text-gray-800 leading-tight mb-1 truncate" title={user.name}>{user.name}</h3>
                    <p className="text-sm font-medium text-gray-500 mb-3 truncate" title={user.email}>{user.email}</p>
                    
                    <div className="space-y-2">
                        <div className="flex items-center text-xs font-semibold text-gray-500 bg-white/50 p-2 rounded-lg border border-white/50">
                            <span className="w-16 text-gray-400 uppercase text-[10px] font-bold">ID</span>
                            <span className="font-mono text-gray-700">{type === 'teacher' ? user.teacherId : user.studentId}</span>
                        </div>
                        
                        {type === 'teacher' && (
                            <div className="flex items-center text-xs font-semibold text-gray-500 bg-white/50 p-2 rounded-lg border border-white/50">
                                <span className="w-16 text-gray-400 uppercase text-[10px] font-bold">Subject</span>
                                <span className="text-amber-600">{user.subject}</span>
                            </div>
                        )}
                        
                        {type === 'student' && (
                             <div className="flex items-center text-xs font-semibold text-gray-500 bg-white/50 p-2 rounded-lg border border-white/50">
                                <span className="w-16 text-gray-400 uppercase text-[10px] font-bold">Class</span>
                                <span className="text-blue-600">{user.class} {user.section}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2 mt-auto">
                    <button 
                        onClick={(e) => { e.preventDefault(); onSuspend(type, user._id); }}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${isSuspended ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'}`}
                    >
                        {isSuspended ? 'Activate' : 'Suspend'}
                    </button>
                    
                    {onEdit && (
                        <button 
                            onClick={onEdit}
                            className="py-2 rounded-xl text-xs font-bold transition-all bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100"
                        >
                            Edit
                        </button>
                    )}
                    
                    <button 
                        onClick={() => onTerminate(type, user._id)}
                        className="py-2 rounded-xl text-xs font-bold transition-all bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
                    >
                        Delete
                    </button>
                </div>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white/95 backdrop-blur-2xl rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/50"
            >
                <div className="flex justify-between items-center mb-6">
                    <div>
                         <h3 className="text-2xl font-black text-gray-900 tracking-tight">{mode === 'add' ? 'New' : 'Edit'} {type === 'teacher' ? 'Teacher' : 'Student'}</h3>
                         <p className="text-sm text-gray-500 font-medium">{mode === 'add' ? 'Enter details to create account' : 'Update account information'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full text-gray-400 transition-colors">✕</button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4">
                        <input name="name" placeholder="Full Name" required value={formData.name || ''} onChange={handleChange} className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium" />
                        <input name="email" type="email" placeholder="Email Address" required value={formData.email || ''} onChange={handleChange} className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium" />
                        {type === 'student' && mode === 'add' && <input name="password" type="text" placeholder="Default Password" required onChange={handleChange} className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium" />}
                        
                        {type === 'teacher' && (
                            <div className="grid grid-cols-2 gap-4">
                                <input name="teacherId" placeholder="Teacher ID" required disabled={mode === 'edit'} value={formData.teacherId || ''} onChange={handleChange} className={`col-span-2 w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium ${mode === 'edit' ? 'bg-gray-100 text-gray-500' : 'bg-gray-50'}`} />
                                <input name="subject" placeholder="Subject" required value={formData.subject || ''} onChange={handleChange} className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium" />
                                <input name="classConfig" placeholder="Class (e.g. 10A)" value={formData.classConfig || ''} onChange={handleChange} className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium" />
                            </div>
                        )}
                        
                        {type === 'student' && (
                            <div className="grid grid-cols-2 gap-4">
                                <input name="studentId" placeholder="Student ID" required disabled={mode === 'edit'} value={formData.studentId || ''} onChange={handleChange} className={`col-span-2 w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium ${mode === 'edit' ? 'bg-gray-100 text-gray-500' : 'bg-gray-50'}`} />
                                <input name="class" placeholder="Class" required value={formData.class || ''} onChange={handleChange} className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium" />
                                <input name="section" placeholder="Section" value={formData.section || ''} onChange={handleChange} className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium" />
                            </div>
                        )}
                    </div>

                    <div className="flex space-x-3 mt-8 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-bold transition-colors shadow-sm">Cancel</button>
                        <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] font-bold transition-all shadow-md">{mode === 'add' ? 'Create Account' : 'Save Changes'}</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default AdminDashboard;
