import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardNavbar from '../components/DashboardNavbar';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { FaArrowLeft, FaMagic, FaSave, FaPaperPlane, FaQuestionCircle } from 'react-icons/fa';

const StudyNotes = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [topic, setTopic] = useState('');
    const [subject, setSubject] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Q&A
    const [question, setQuestion] = useState('');
    const [qaList, setQaList] = useState([]);
    const [asking, setAsking] = useState(false);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!topic || !subject) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoading(true);
        setNotes(''); 
        setQaList([]); 

        try {
            console.log("Generating notes for:", subject, topic);
            const { data } = await axios.post('/student/generate-notes', { topic, subject });
            console.log("Notes response:", data);

            if (data && typeof data.notes === 'string') {
                setNotes(data.notes);
                toast.success("Notes generated successfully!");
            } else {
                console.error("Invalid notes format:", data);
                toast.error("Received invalid data from AI");
            }
        } catch (error) {
            console.error("Generator Error:", error);
            toast.error(error.response?.data?.message || "Failed to generate notes");
        } finally {
            setLoading(false);
        }
    };

    const handleAskQuestion = async (e) => {
        e.preventDefault();
        if (!question) return;

        setAsking(true);
        try {
            const { data } = await axios.post('/student/ask-question', { topic, subject, question });
            setQaList([...qaList, { question, answer: data.answer }]);
            setQuestion('');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to get answer");
        } finally {
            setAsking(false);
        }
    };

    const handleSaveNote = async () => {
        if (!notes) return;
        try {
            await axios.post('/student/save-note', { topic, subject, content: notes });
            toast.success("Note saved to Favorites! ⭐");
        } catch (error) {
            toast.error("Failed to save note");
        }
    };

    const inputClass = "w-full px-5 py-3 bg-white/60 border border-white/50 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium text-gray-800 placeholder-gray-400 backdrop-blur-sm shadow-sm hover:shadow-md";

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 pt-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
             {/* Background Shapes */}
             <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
            </div>

            <DashboardNavbar />
            
            <div className="max-w-5xl mx-auto relative z-10 pb-20">
                <button 
                    onClick={() => navigate('/student/dashboard')}
                    className="flex items-center text-gray-500 hover:text-amber-600 font-bold mb-6 transition-colors gap-2 group"
                >
                    <div className="bg-white/50 p-2 rounded-full group-hover:bg-amber-100 transition-colors">
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    </div>
                     Back to Dashboard
                </button>

                <div className="text-center mb-10">
                    <div className="inline-block p-4 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl shadow-lg mb-4 text-white">
                        <FaMagic size={32} />
                    </div>
                   <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">AI Study Assistant</h1>
                   <p className="text-gray-500 mt-2 font-medium">Generate smart, detailed study notes on any topic instantly.</p>
                </div>

                <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50 relative overflow-hidden">
                    <form onSubmit={handleGenerate} className="space-y-6 relative z-10">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-extrabold text-gray-700 mb-2 uppercase tracking-wide">Subject</label>
                                <input 
                                    type="text" 
                                    required
                                    className={inputClass}
                                    placeholder="e.g. Physics"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-extrabold text-gray-700 mb-2 uppercase tracking-wide">Topic</label>
                                <input 
                                    type="text" 
                                    required
                                    className={inputClass}
                                    placeholder="e.g. Newton's Laws of Motion"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full py-4 rounded-xl text-white font-black text-lg shadow-lg transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2 ${
                                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-xl hover:from-amber-600 hover:to-orange-700'
                            }`}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Generating Context...
                                </>
                            ) : (
                                <>
                                    <FaMagic /> Generate Notes
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Notes Display */}
                <AnimatePresence>
                    {notes && (
                        <motion.div 
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-12 space-y-8"
                        >
                             <div className="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl border border-white/60 relative prose lg:prose-xl max-w-none text-gray-800">
                                 <button 
                                    onClick={handleSaveNote}
                                    className="absolute top-6 right-6 bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all flex items-center gap-2 hover:scale-105"
                                 >
                                    <FaSave /> Save Note
                                 </button>
                                 <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 mb-6 border-b border-gray-100 pb-4">
                                     {topic} <span className="text-gray-400 font-medium text-lg ml-2">({subject})</span>
                                 </h2>
                                 <div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg">
                                    {notes}
                                 </div>
                            </div>

                            {/* Q&A Section */}
                            <div className="space-y-6">
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-[1px] rounded-3xl shadow-xl">
                                    <div className="bg-white/95 backdrop-blur-xl p-8 rounded-[23px] h-full">
                                        <div className="flex items-center gap-3 mb-6">
                                            <FaQuestionCircle className="text-indigo-600 text-2xl" />
                                            <h3 className="text-xl font-black text-gray-900">Have a question?</h3>
                                        </div>
                                        <form onSubmit={handleAskQuestion} className="flex gap-4">
                                            <input 
                                                type="text" 
                                                className="flex-1 px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                                                placeholder="Ask specifically about the notes above..."
                                                value={question}
                                                onChange={(e) => setQuestion(e.target.value)}
                                            />
                                            <button 
                                                type="submit" 
                                                disabled={asking || !question}
                                                className={`px-8 py-4 rounded-2xl text-white font-bold transition-all shadow-lg flex items-center gap-2 ${
                                                    asking ? 'bg-gray-400' : 'bg-gray-900 hover:bg-black hover:scale-105'
                                                }`}
                                            >
                                                {asking ? 'Thinking...' : <><FaPaperPlane /> Ask AI</>}
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* Q&A History */}
                                {qaList.map((qa, index) => (
                                     <motion.div 
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-md border border-indigo-50"
                                     >
                                         <div className="flex gap-4">
                                             <div className="bg-indigo-100 p-3 rounded-full h-fit text-indigo-600">
                                                <FaQuestionCircle />
                                             </div>
                                             <div>
                                                 <p className="font-bold text-gray-900 text-lg mb-2">{qa.question}</p>
                                                 <div className="text-gray-600 leading-relaxed">
                                                    <ReactMarkdown>{qa.answer}</ReactMarkdown>
                                                 </div>
                                             </div>
                                         </div>
                                     </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default StudyNotes;
