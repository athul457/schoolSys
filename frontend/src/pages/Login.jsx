import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [role, setRole] = useState('Student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password, role);
    if (success) {
      if (role === 'Admin') navigate('/admin/dashboard');
      else if (role === 'Teacher') navigate('/teacher/dashboard');
      else navigate('/student/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
        </div>

      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/50 relative z-10"
      >
        <div className="text-center mb-8">
            <span className="text-4xl">🏫</span>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-2">Welcome Back</h2>
            <p className="text-gray-500 mt-1">Login to access your dashboard</p>
        </div>
        
        <div className="flex bg-gray-100/50 p-1 rounded-xl mb-8 border border-gray-200">
          {['Student', 'Teacher', 'Admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                role === r 
                ? 'bg-white text-amber-600 shadow-md' 
                : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {role === 'Student' ? 'Student ID' : 'Password'}
            </label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
              placeholder={role === 'Student' ? 'Enter your Student ID' : '••••••••'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Login as {role}
          </motion.button>
        </form>
        
        {role === 'Admin' && (
             <div className="mt-6 text-center">
                 <button onClick={() => navigate('/register-admin')} className="text-sm text-amber-600 hover:text-amber-700 font-medium hover:underline">Register New Admin</button>
             </div>
        )}

      </motion.div>
    </div>
  );
};

export default Login;
