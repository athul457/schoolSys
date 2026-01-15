import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ExamPortal = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [answers, setAnswers] = useState({}); // { 0: 'Option A', 1: 'Option B' }
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchExam = async () => {
            try {
                // Determine API endpoint - reusing available exams list? 
                // No, we need a specific 'get exam' endpoint or filter from list.
                // Assuming we can fetch details from the list endpoint or a new one.
                // Since our `getAvailableExams` sends all data (except answers), we can re-fetch list and filter 
                // OR add a specific GET /exam/:id endpoint.
                // For simplicity/speed, I'll filter from list since we already populate questions.
                // Wait, `getAvailableExams` in controller sends questions.
                
                const { data } = await axios.get('/student/exams');
                const selectedExam = data.find(e => e._id === id);
                
                if (selectedExam) {
                    setExam(selectedExam);
                } else {
                    toast.error('Exam not found');
                    navigate('/student/dashboard');
                }
            } catch (error) {
                console.error(error);
                toast.error('Failed to load exam');
            } finally {
                setLoading(false);
            }
        };
        fetchExam();
    }, [id, navigate]);

    const handleOptionSelect = (questionIndex, option) => {
        setAnswers(prev => ({
            ...prev,
            [questionIndex]: option
        }));
    };

    const handleSubmit = async () => {
        if (!exam) return;
        
        // Validation: Ensure all questions answered?
        if (Object.keys(answers).length < exam.questions.length) {
            toast.error('Please answer all questions');
            return;
        }

        setSubmitting(true);
        try {
            // Convert answers object to array based on index
            const answersArray = exam.questions.map((_, index) => answers[index]);

            const { data } = await axios.post(`/student/exam/${id}`, { answers: answersArray });
            
            toast.success(`Exam submitted! Score: ${data.score}/${data.total}`);
            navigate('/student/dashboard');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Exam...</div>;
    if (!exam) return null;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <div className="bg-white shadow-sm border-b px-6 py-4 fixed w-full top-0 z-10 flex justifying-between items-center">
                <h1 className="text-xl font-bold text-gray-800">{exam.name}</h1>
                <div className="text-gray-600 text-sm">
                    Time Limit: N/A
                </div>
            </div>

            <div className="max-w-3xl mx-auto pt-24 pb-20 px-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-blue-800 text-sm font-medium">
                        Instructions: Answer all questions. Once submitted, you cannot undo.
                    </p>
                </div>

                <div className="space-y-8">
                    {exam.questions.map((q, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                <span className="text-gray-400 mr-2">{index + 1}.</span>
                                {q.questionText}
                            </h3>
                            
                            <div className="space-y-3">
                                {q.options.map((option, optIndex) => (
                                    <label 
                                        key={optIndex} 
                                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                                            answers[index] === option 
                                            ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' 
                                            : 'hover:bg-gray-50 border-gray-200'
                                        }`}
                                    >
                                        <input 
                                            type="radio" 
                                            name={`question-${index}`} 
                                            value={option}
                                            checked={answers[index] === option}
                                            onChange={() => handleOptionSelect(index, option)}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <span className="ml-3 text-gray-700">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex justify-end">
                    <button 
                        onClick={handleSubmit} 
                        disabled={submitting}
                        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                        {submitting ? 'Submitting...' : 'Submit Exam'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExamPortal;
