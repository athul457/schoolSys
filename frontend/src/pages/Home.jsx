import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 pt-16 overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
          <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-yellow-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-orange-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-4rem)]">
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left pt-10 lg:pt-0"
          >
            <motion.div variants={itemVariants} className="inline-block mb-4 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-700 font-semibold text-sm shadow-sm">
                🚀 The Future of School Management
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
              Empowering <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-red-500">
                Education
              </span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Streamline administration, enhance teaching, and boost student performance with our all-in-one smart management platform.
            </motion.p>
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/login">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all"
                >
                  Get Started Now
                </motion.button>
              </Link>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-800 border border-gray-200 rounded-xl font-bold hover:border-amber-300 hover:text-amber-600 hover:bg-white transition-all shadow-md"
               >
                Explore Features
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative hidden lg:block"
          >
             {/* Abstract Dashboard Mockup Visualization */}
             <div className="relative w-full aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-full opacity-10 filter blur-3xl animate-pulse"></div>
                <div className="relative grid grid-cols-2 gap-4 p-8">
                    <motion.div 
                        whileHover={{ y: -5 }}
                        className="col-span-2 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/50"
                    >
                        <div className="h-4 w-1/3 bg-gray-200 rounded mb-4"></div>
                        <div className="h-32 bg-amber-50/50 rounded-xl flex items-end justify-between px-4 pb-2 gap-2">
                            {[40, 70, 45, 90, 65, 85, 50].map((h, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ duration: 1, delay: i * 0.1 }}
                                    className="w-full bg-gradient-to-t from-amber-400 to-orange-500 rounded-t-sm opacity-80"
                                />
                            ))}
                        </div>
                    </motion.div>
                    <motion.div 
                         whileHover={{ y: -5 }}
                         className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/50 flex flex-col items-center justify-center text-center"
                    >
                        <div className="text-4xl mb-2">🎓</div>
                        <div className="font-bold text-gray-800">Students</div>
                        <div className="text-green-500 font-bold">+12%</div>
                    </motion.div>
                    <motion.div 
                         whileHover={{ y: -5 }}
                         className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/50 flex flex-col items-center justify-center text-center"
                    >
                        <div className="text-4xl mb-2">✅</div>
                        <div className="font-bold text-gray-800">Attendance</div>
                        <div className="text-amber-500 font-bold">98%</div>
                    </motion.div>
                </div>
             </div>
          </motion.div>

        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
                <motion.span 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="text-amber-600 font-bold tracking-wider uppercase text-sm"
                >
                    Why Choose Us
                </motion.span>
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-extrabold text-gray-900 mt-2 mb-6"
                >
                    Everything you need to <br/> run your school efficiently.
                </motion.h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {[
                    { title: 'Admin Control', desc: 'Complete control over teachers, students, and system settings.', icon: '👑', color: 'from-yellow-400 to-orange-500' },
                    { title: 'Teacher Tools', desc: 'Create exams, grade results, and track progress effortlessly.', icon: '👩‍🏫', color: 'from-amber-400 to-red-500' },
                    { title: 'Student Portal', desc: 'Take online exams, view real-time results, and AI study notes.', icon: '🎓', color: 'from-orange-400 to-pink-500' }
                ].map((feature, idx) => (
                    <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.2 }}
                        whileHover={{ y: -10 }}
                        className="group p-8 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-300"
                    >
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-3xl text-white mb-6 shadow-md group-hover:scale-110 transition-transform`}>
                            {feature.icon}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
