import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardNavbar from '../components/DashboardNavbar';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { FaBookOpen, FaClipboardList, FaCheckCircle, FaStar, FaPenFancy, FaArrowRight, FaSearch, FaTimes } from 'react-icons/fa';

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

const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('exams'); // exams, results, notes
    
    const [exams, setExams] = useState([]);
    const [results, setResults] = useState([]);
    const [savedNotes, setSavedNotes] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [loadingResults, setLoadingResults] = useState(false);
    
    // Note Viewer
    const [selectedNote, setSelectedNote] = useState(null);

    // Search
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [examsRes, notesRes, resultsRes] = await Promise.all([
                    axios.get('/student/exams'),
                    axios.get('/student/saved-notes'),
                    axios.get('/student/results') // Fetch results upfront for stats
                ]);
                setExams(examsRes.data);
                setSavedNotes(notesRes.data);
                setResults(resultsRes.data);
            } catch (error) {
                console.error(error);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchDashboardData();
    }, [user]);

    // Computed Stats
    const passedCount = results.filter(r => r.marksObtained >= (r.exam?.passMarks || 0)).length;
    
    // Filtering
    const filteredExams = exams.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.subject.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredResults = results.filter(r => r.exam?.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredNotes = savedNotes.filter(n => n.topic.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 pt-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
             {/* Background Shapes */}
             <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
            </div>

            <DashboardNavbar />
            
            <div className="max-w-7xl mx-auto relative z-10 pb-10">
                <div className="mb-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Student Dashboard</h1>
                        <p className="text-gray-500 mt-2 font-medium">Welcome back, {user?.name}. Keep learning!</p>
                    </div>
                     <button 
                        onClick={() => navigate('/student/study-notes')}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-xl hover:scale-105 transition-all font-bold flex items-center gap-2 shadow-lg"
                    >
                        <FaPenFancy /> ✨ Geneate AI Notes
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <StatsCard title="Available Exams" count={exams.length} icon={FaClipboardList} color="amber" />
                    <StatsCard title="Exams Passed" count={passedCount} icon={FaCheckCircle} color="green" />
                    <StatsCard title="Saved Notes" count={savedNotes.length} icon={FaStar} color="indigo" />
                </div>

                {/* Tabs & Search */}
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
                     <div className="flex bg-white/60 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-white/50 overflow-x-auto max-w-full">
                        <button 
                            onClick={() => setActiveTab('exams')}
                            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'exams' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' : 'text-gray-600 hover:bg-white/50 hover:text-amber-600'}`}
                        >
                            <FaClipboardList /> <span>Exams</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('results')}
                            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'results' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' : 'text-gray-600 hover:bg-white/50 hover:text-green-600'}`}
                        >
                            <FaCheckCircle /> <span>Results</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('notes')}
                            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'notes' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' : 'text-gray-600 hover:bg-white/50 hover:text-indigo-600'}`}
                        >
                            <FaBookOpen /> <span>Study Notes</span>
                        </button>
                    </div>

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
                </div>

                <AnimatePresence mode='wait'>
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                         {/* EXAMS TAB */}
                         {activeTab === 'exams' && (
                             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                 {filteredExams.map((exam) => (
                                     <div key={exam._id} className="group bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/60 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                                         <div className="flex justify-between items-start mb-4">
                                            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-extrabold uppercase tracking-wide">
                                                {exam.subject}
                                            </span>
                                             <span className="text-xs font-bold text-gray-400">
                                                {new Date(exam.date).toLocaleDateString()}
                                             </span>
                                         </div>
                                         
                                         <h3 className="text-xl font-black text-gray-800 mb-2">{exam.name}</h3>
                                         <div className="flex items-center text-sm text-gray-500 mb-6">
                                            <span className="font-bold mr-1">Total Marks:</span> {exam.fullMarks}
                                         </div>
                                         
                                          <button 
                                            onClick={() => navigate(`/student/exam/${exam._id}`)}
                                            className="mt-auto w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg font-bold flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-transform"
                                        >
                                             Start Exam <FaArrowRight />
                                        </button>
                                     </div>
                                 ))}
                                 {filteredExams.length === 0 && <EmptyState message="No exams available." icon={FaClipboardList} />}
                             </div>
                         )}

                         {/* RESULTS TAB */}
                         {activeTab === 'results' && (
                             <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-white/50">
                                 {filteredResults.length === 0 ? (
                                     <EmptyState message="No results found." icon={FaCheckCircle} />
                                 ) : (
                                     <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50/80 text-gray-500 font-bold uppercase text-xs">
                                                <tr>
                                                    <th className="px-6 py-4">Exam Name</th>
                                                    <th className="px-6 py-4">Subject</th>
                                                    <th className="px-6 py-4">Score</th>
                                                    <th className="px-6 py-4">Status</th>
                                                    <th className="px-6 py-4">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {filteredResults.map((res) => {
                                                    const passed = res.marksObtained >= (res.exam?.passMarks || 0);
                                                    return (
                                                        <tr key={res._id} className="hover:bg-white/60 transition-colors">
                                                            <td className="px-6 py-4 font-bold text-gray-900">{res.exam?.name || 'N/A'}</td>
                                                            <td className="px-6 py-4 text-gray-600 font-medium">{res.exam?.subject || 'N/A'}</td>
                                                            <td className="px-6 py-4">
                                                                <span className="text-lg font-black text-gray-800">{res.marksObtained}</span>
                                                                <span className="text-xs text-gray-400 ml-1">/ {res.exam?.fullMarks}</span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`px-2 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wide ${passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                                    {passed ? 'Passed' : 'Failed'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-gray-400 text-xs font-mono">
                                                                {new Date(res.createdAt).toLocaleDateString()}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                     </div>
                                 )}
                             </div>
                         )}

                         {/* NOTES TAB */}
                         {activeTab === 'notes' && (
                             <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                 {filteredNotes.map((note) => (
                                     <motion.div 
                                         key={note._id}
                                         whileHover={{ scale: 1.02 }}
                                         onClick={() => setSelectedNote(note)}
                                         className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-indigo-50 hover:border-indigo-200 cursor-pointer transition flex flex-col h-full group"
                                     >
                                         <div className="flex justify-between items-start mb-3">
                                             <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-xs font-bold uppercase tracking-wide">
                                                 {note.subject}
                                             </span>
                                             <FaStar className="text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                         </div>
                                         <h3 className="font-bold text-lg text-gray-800 mb-2 leading-tight">{note.topic}</h3>
                                         <p className="text-xs text-gray-400 mt-auto pt-4 border-t border-gray-100 flex justify-between">
                                             <span>Created</span>
                                             <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                                         </p>
                                     </motion.div>
                                 ))}
                                 {filteredNotes.length === 0 && <EmptyState message="No saved notes found." icon={FaBookOpen} />}
                             </div>
                         )}
                    </motion.div>
                </AnimatePresence>

                 {/* Note View Modal */}
                 <AnimatePresence>
                     {selectedNote && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedNote(null)}>
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden border border-white/50"
                            >
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900">{selectedNote.topic}</h2>
                                        <p className="text-indigo-600 font-bold text-sm">{selectedNote.subject}</p>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedNote(null)}
                                        className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full text-gray-400 transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className="p-8 overflow-y-auto prose lg:prose-xl max-w-none bg-white">
                                    <ReactMarkdown>{selectedNote.content}</ReactMarkdown>
                                </div>
                            </motion.div>
                        </div>
                     )}
                 </AnimatePresence>
            </div>
        </div>
    );
};

const EmptyState = ({ message, icon: Icon }) => (
    <div className="col-span-full py-20 text-center">
        <div className="inline-block p-6 bg-white/50 backdrop-blur-sm rounded-full mb-4 border border-white/60 shadow-lg">
            <Icon className="text-gray-300 text-5xl" />
        </div>
        <p className="text-gray-500 font-bold text-lg">{message}</p>
    </div>
);

export default StudentDashboard;
