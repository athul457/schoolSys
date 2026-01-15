import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardNavbar from '../components/DashboardNavbar';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [examsRes, resultsRes] = await Promise.all([
                    axios.get('/student/exams'),
                    axios.get('/student/results')
                ]);
                setExams(examsRes.data);
                setResults(resultsRes.data);
            } catch (error) {
                console.error(error);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchData();
    }, [user]);
    
    return (
        <div className="min-h-screen bg-gray-50 pt-20 px-4 sm:px-6 lg:px-8">
            <DashboardNavbar />
            
            <div className="max-w-7xl mx-auto pt-6 space-y-8 pb-10">
                 <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
                    <p className="text-gray-600">Welcome, {user?.name}</p>
                 </div>
                 
                 {/* Available Exams Section */}
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-xl shadow-sm border border-gray-100"
                 >
                     <h2 className="text-xl font-bold mb-6">Available Exams</h2>
                     
                     {loading ? (
                         <p>Loading exams...</p>
                     ) : exams.length === 0 ? (
                         <p className="text-gray-500">No exams scheduled for your class.</p>
                     ) : (
                         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                             {exams.map((exam) => (
                                 <div key={exam._id} className="p-6 border rounded-xl hover:shadow-md transition-shadow">
                                     <h3 className="font-bold text-lg mb-2 text-blue-900">{exam.name}</h3>
                                     <p className="text-sm text-gray-600 mb-1"><span className="font-semibold">Subject:</span> {exam.subject}</p>
                                     <p className="text-sm text-gray-600 mb-1"><span className="font-semibold">Date:</span> {new Date(exam.date).toLocaleDateString()}</p>
                                     <p className="text-sm text-gray-600 mb-4"><span className="font-semibold">Marks:</span> {exam.fullMarks}</p>
                                     
                                     <button 
                                        onClick={() => navigate(`/student/exam/${exam._id}`)}
                                        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                     >
                                         Start Exam
                                     </button>
                                 </div>
                             ))}
                         </div>
                     )}
                 </motion.div>

                 {/* Results Section */}
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-8 rounded-xl shadow-sm border border-gray-100"
                 >
                     <h2 className="text-xl font-bold mb-6">My Results</h2>
                     
                     {loading ? (
                         <p>Loading results...</p>
                     ) : results.length === 0 ? (
                         <p className="text-gray-500">No results found yet.</p>
                     ) : (
                         <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-600 font-semibold uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3">Exam</th>
                                        <th className="px-4 py-3">Subject</th>
                                        <th className="px-4 py-3">Score</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {results.map((res) => (
                                        <tr key={res._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-900">{res.exam?.name || 'N/A'}</td>
                                            <td className="px-4 py-3 text-gray-600">{res.exam?.subject || 'N/A'}</td>
                                            <td className="px-4 py-3 font-bold text-blue-600">
                                                {res.marksObtained} / {res.exam?.fullMarks}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    (res.marksObtained >= (res.exam?.passMarks || 0)) 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {(res.marksObtained >= (res.exam?.passMarks || 0)) ? 'Passed' : 'Failed'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 text-sm">
                                                {new Date(res.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                     )}
                 </motion.div>
            </div>
        </div>
    );
};

export default StudentDashboard;
