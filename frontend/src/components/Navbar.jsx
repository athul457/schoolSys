import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashboardRoute = () => {
      if (!user) return '/';
      if (user.role === 'Admin') return '/admin/dashboard';
      if (user.role === 'Teacher') return '/teacher/dashboard';
      if (user.role === 'Student') return '/student/dashboard';
      return '/';
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-md fixed w-full z-50 top-0 left-0 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
             <motion.div 
               whileHover={{ scale: 1.1 }}
               className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
             >
               SchoolSys
             </motion.div>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Home</Link>
            
            {user ? (
              <>
                <Link to={dashboardRoute()} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Go to Dashboard
                </Link>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{user.role}</span>
                </div>
              </>
            ) : (
              <Link to="/login">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Login
                </motion.button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
