import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import RegisterAdmin from './pages/RegisterAdmin';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import StudyNotes from './pages/StudyNotes';
import ExamPortal from './pages/ExamPortal';

const AppContent = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Toaster position="top-right" />
            {isHomePage && <Navbar />}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register-admin" element={<RegisterAdmin />} />
                
                {/* Protected Routes */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                
                {/* Student Routes */}
                <Route path="/student/dashboard" element={<ProtectedRoute role="Student"><StudentDashboard /></ProtectedRoute>} />
                <Route path="/student/study-notes" element={<ProtectedRoute role="Student"><StudyNotes /></ProtectedRoute>} />
                <Route path="/student/exam/:id" element={<ProtectedRoute role="Student"><ExamPortal /></ProtectedRoute>} />
            </Routes>
        </div>
    );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
