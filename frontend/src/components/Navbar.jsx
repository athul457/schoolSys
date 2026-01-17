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
    <nav className="bg-white/70 backdrop-blur-lg fixed w-full z-50 top-0 left-0 border-b border-white/50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
             <motion.div 
               whileHover={{ rotate: 360 }}
               transition={{ duration: 0.6 }}
               className="text-2xl"
             >
               🏫
             </motion.div>
             <motion.div 
               className="text-2xl font-black bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent tracking-tight group-hover:opacity-80 transition-opacity"
             >
               SchoolSys
             </motion.div>
          </Link>
          
          {/* Nav Links */}
          <div className="flex items-center space-x-1 sm:space-x-4">
             {!user && (
                <button 
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="hidden md:block px-4 py-2 text-gray-600 font-medium hover:text-amber-600 hover:bg-amber-50 rounded-full transition-all"
                >
                  Features
                </button>
             )}

            {user ? (
              <div className="flex items-center gap-4">
                <Link to={dashboardRoute()}>
                   <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-5 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                   >
                     <span>Dashboard</span>
                     {/* <span className="text-white/80">→</span> */}
                   </motion.button>
                </Link>
                <div className="hidden sm:flex items-center gap-2">
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider rounded-full border border-amber-200">
                      {user.role}
                    </span>
                </div>
              </div>
            ) : (
              <Link to="/login">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative px-6 py-2.5 rounded-full font-bold text-white shadow-lg group overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 group-hover:from-amber-600 group-hover:to-orange-700 transition-colors"></span>
                  <span className="relative flex items-center gap-2">
                    Login <span className="text-lg">✨</span>
                  </span>
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
