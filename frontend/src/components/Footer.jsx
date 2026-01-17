import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-16 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-20">
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500 rounded-full mix-blend-screen filter blur-[100px]"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] bg-orange-600 rounded-full mix-blend-screen filter blur-[100px]"></div>
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               className="flex items-center gap-2 mb-4"
            >
               <span className="text-3xl">🏫</span>
               <span className="text-2xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                 SchoolSys
               </span>
            </motion.div>
            <p className="text-slate-400 leading-relaxed max-w-sm mb-6">
                Empowering the next generation of learners and educators with cutting-edge school management tools.
            </p>
            <div className="flex gap-4">
                <a href="https://github.com/athul457/athul457" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xl hover:bg-amber-500 hover:text-white transition-all shadow-md" title="GitHub">
                    💻
                </a>
                <a href="https://www.linkedin.com/in/athul457/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xl hover:bg-blue-600 hover:text-white transition-all shadow-md" title="LinkedIn">
                    👔
                </a>
                <a href="https://athulsukumaran.netlify.app/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xl hover:bg-green-500 hover:text-white transition-all shadow-md" title="Portfolio">
                    🌐
                </a>
            </div>
          </div>

          {/* Links Column */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-3">
                {['Home', 'Features', 'Pricing', 'About Us', 'Contact'].map((item) => (
                    <li key={item}>
                        <a href="#" className="hover:text-amber-400 transition-colors">{item}</a>
                    </li>
                ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Stay Updated</h4>
            <p className="text-sm text-slate-400 mb-4">Subscribe to our newsletter for the latest updates.</p>
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700 focus-within:border-amber-500 transition-colors">
                <input 
                    type="email" 
                    placeholder="Enter email" 
                    className="bg-transparent w-full px-3 py-2 text-white outline-none placeholder-slate-500"
                />
                <button className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-md font-bold hover:shadow-lg transition-all">
                    Go
                </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} SchoolSys. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
