import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaSignOutAlt, FaUserCircle, FaHome, FaCamera } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const DashboardNavbar = () => {
    const { user, logout, updateUserProfile } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', email: '' });
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    const toggleSidebar = () => {
        if (isSidebarOpen) {
            // Reset edit state when closing
            setIsEditing(false);
            setSelectedImage(null);
            setImagePreview(null);
        }
        setIsSidebarOpen(!isSidebarOpen);
    };

    const enableEditMode = () => {
        setEditForm({ name: user.name, email: user.email });
        setImagePreview(user.profileImage ? `https://schoolsys-yr1l.onrender.com${user.profileImage}` : null);
        setIsEditing(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSaveProfile = async () => {
        try {
            const formData = new FormData();
            formData.append('name', editForm.name);
            formData.append('email', editForm.email);
            if (selectedImage) {
                formData.append('image', selectedImage);
            }

            let endpoint = '/teacher/profile'; // Default
            if (user?.role === 'Admin') endpoint = '/admin/profile';
            if (user?.role === 'Student') endpoint = '/student/profile';

            const { data } = await axios.put(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            updateUserProfile(data);
            setIsEditing(false);
            toast.success('Profile updated');
        } catch (error) {
            console.error('Update failed', error);
            const message = error.response?.data?.message || 'Update failed';
            toast.error(message);
        }
    };

    return (
        <>
            {/* Top Bar inside Dashboard */}
            <div className="bg-white/70 backdrop-blur-md shadow-sm fixed w-full z-40 top-0 left-0 border-b border-white/50 h-16 px-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <button onClick={() => navigate('/')} className="p-2 hover:bg-amber-50 rounded-lg text-gray-700 transition-colors" title="Back to Home">
                        <FaHome size={24} />
                    </button>
                    <span className="text-xl font-black bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent hidden sm:inline-block tracking-tight">
                        SchoolSys {user?.role}
                    </span>
                 </div>
                
                <div 
                    onClick={toggleSidebar}
                    className="flex items-center space-x-3 text-gray-600 cursor-pointer hover:bg-amber-50/50 p-2 rounded-xl transition-all border border-transparent hover:border-amber-100"
                >
                     <span className="font-bold text-gray-700 hidden md:block">{user?.name}</span>
                    {user?.profileImage ? (
                        <img src={`https://schoolsys-yr1l.onrender.com${user.profileImage}`} alt="Profile" className="w-9 h-9 rounded-full object-cover border-2 border-amber-100 shadow-sm" />
                    ) : (
                        <FaUserCircle size={24} className="text-amber-300"/>
                    )}
                </div>
            </div>

            {/* Profile Panel Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={toggleSidebar}
                            className="fixed inset-0 bg-slate-900/20 z-50 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-80 bg-white/95 backdrop-blur-2xl shadow-2xl z-50 p-6 flex flex-col overflow-y-auto border-l border-white/50"
                        >
                            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                                <h2 className="text-2xl font-bold text-gray-800">Profile</h2>
                                <button onClick={toggleSidebar} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                                    <FaTimes size={20} />
                                </button>
                            </div>

                            <div className="flex-1 space-y-6">
                                <div className="flex flex-col items-center space-y-3 py-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl relative border border-amber-100">
                                    {/* Edit Button */}
                                    {(user?.role === 'Teacher' || user?.role === 'Admin' || user?.role === 'Student') && !isEditing && (
                                        <button onClick={enableEditMode} className="absolute top-2 right-2 text-amber-600 hover:text-amber-700 text-sm font-bold bg-white/50 px-2 py-1 rounded-md hover:bg-white transition-all">
                                            Edit
                                        </button>
                                    )}

                                    {/* Profile Image */}
                                    <div className="relative group">
                                        <div className={`w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-200 flex items-center justify-center relative ${isEditing ? 'cursor-pointer hover:opacity-90' : ''}`}>
                                            {isEditing && imagePreview ? (
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : user?.profileImage ? (
                                                <img src={`https://schoolsys-yr1l.onrender.com${user.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-3xl font-bold text-amber-400">{user?.name?.charAt(0).toUpperCase()}</span>
                                            )}
                                            
                                            {/* Camera Overlay */}
                                            {isEditing && (
                                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <FaCamera className="text-white text-2xl drop-shadow-md" />
                                                </div>
                                            )}
                                        </div>
                                        
                                        {isEditing && (
                                            <input 
                                                type="file" 
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                                accept="image/*" 
                                                onChange={handleImageChange} 
                                                title="Change Profile Photo"
                                            />
                                        )}
                                    </div>

                                    {isEditing ? (
                                        <div className="w-full px-4 space-y-3">
                                            <input 
                                                className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 outline-none bg-white/50"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                                placeholder="Name"
                                            />
                                            <input 
                                                className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 outline-none bg-white/50"
                                                value={editForm.email}
                                                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                                placeholder="Email"
                                            />
                                            <div className="flex space-x-2 pt-2">
                                                <button onClick={() => setIsEditing(false)} className="flex-1 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded text-sm font-medium transition-colors">Cancel</button>
                                                <button onClick={handleSaveProfile} className="flex-1 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded text-sm font-bold shadow-md hover:shadow-lg transition-all">Save</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <h3 className="text-xl font-bold text-gray-900">{user?.name}</h3>
                                            <p className="text-sm text-gray-500">{user?.email}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Role</label>
                                        <p className="font-bold text-gray-800">{user?.role}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">User ID</label>
                                        <p className="font-bold text-gray-800 font-mono text-sm">
                                            {user?.teacherId || user?.studentId || (user?.role === 'Admin' ? 'Administrator' : 'N/A')}
                                        </p>
                                    </div>
                                    {user?.subject && (
                                         <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Subject</label>
                                            <p className="font-bold text-gray-800">{user.subject}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button 
                                onClick={handleLogout}
                                className="w-full mt-auto flex items-center justify-center space-x-2 bg-red-50 text-red-600 py-3 rounded-xl hover:bg-red-100 transition-colors font-bold cursor-pointer"
                            >
                                <FaSignOutAlt />
                                <span>Logout</span>
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

export default DashboardNavbar;
