import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaSignOutAlt, FaUserCircle, FaHome } from 'react-icons/fa';
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
        setImagePreview(user.profileImage ? `http://localhost:3030${user.profileImage}` : null);
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
            <div className="bg-white/80 backdrop-blur-md shadow-sm fixed w-full z-40 top-0 left-0 border-b border-gray-200 h-16 px-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <button onClick={toggleSidebar} className="p-2 hover:bg-gray-100 rounded-lg text-gray-700">
                        <FaBars size={24} />
                    </button>
                    <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-700" title="Back to Home">
                        <FaHome size={24} />
                    </button>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:inline-block">
                        SchoolSys {user?.role}
                    </span>
                 </div>
                
                <div className="hidden md:flex items-center space-x-2 text-gray-600">
                    {user?.profileImage ? (
                        <img src={`http://localhost:3030${user.profileImage}`} alt="Profile" className="w-8 h-8 rounded-full object-cover border" />
                    ) : (
                        <FaUserCircle size={20}/>
                    )}
                    <span className="font-medium">{user?.name}</span>
                </div>
            </div>

            {/* Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={toggleSidebar}
                            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 p-6 flex flex-col overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-8 border-b pb-4">
                                <h2 className="text-2xl font-bold text-gray-800">Profile</h2>
                                <button onClick={toggleSidebar} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                                    <FaTimes size={20} />
                                </button>
                            </div>

                            <div className="flex-1 space-y-6">
                                <div className="flex flex-col items-center space-y-3 py-6 bg-gray-50 rounded-2xl relative">
                                    {/* Edit Button */}
                                    {/* Edit Button */}
                                    {(user?.role === 'Teacher' || user?.role === 'Admin' || user?.role === 'Student') && !isEditing && (
                                        <button onClick={enableEditMode} className="absolute top-2 right-2 text-blue-600 hover:text-blue-800 text-sm font-semibold">
                                            Edit
                                        </button>
                                    )}

                                    {/* Profile Image */}
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                                        {isEditing && imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : user?.profileImage ? (
                                            <img src={`http://localhost:3030${user.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-2xl font-bold text-gray-500">{user?.name?.charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    
                                    {isEditing && (
                                        <div className="mt-2">
                                            <label className="text-xs text-blue-600 cursor-pointer hover:underline">
                                                Change Photo
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                            </label>
                                        </div>
                                    )}

                                    {isEditing ? (
                                        <div className="w-full px-4 space-y-3">
                                            <input 
                                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                                placeholder="Name"
                                            />
                                            <input 
                                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                                value={editForm.email}
                                                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                                placeholder="Email"
                                            />
                                            <div className="flex space-x-2 pt-2">
                                                <button onClick={() => setIsEditing(false)} className="flex-1 py-1 bg-gray-200 rounded text-sm">Cancel</button>
                                                <button onClick={handleSaveProfile} className="flex-1 py-1 bg-blue-600 text-white rounded text-sm">Save</button>
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
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <label className="text-xs font-semibold text-gray-400 uppercase">Role</label>
                                        <p className="font-medium text-gray-800">{user?.role}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <label className="text-xs font-semibold text-gray-400 uppercase">User ID</label>
                                        <p className="font-medium text-gray-800">
                                            {user?.teacherId || user?.studentId || (user?.role === 'Admin' ? 'Administrator' : 'N/A')}
                                        </p>
                                    </div>
                                    {user?.subject && (
                                         <div className="p-4 bg-gray-50 rounded-xl">
                                            <label className="text-xs font-semibold text-gray-400 uppercase">Subject</label>
                                            <p className="font-medium text-gray-800">{user.subject}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button 
                                onClick={handleLogout}
                                className="w-full mt-auto flex items-center justify-center space-x-2 bg-red-50 text-red-600 py-3 rounded-xl hover:bg-red-100 transition-colors font-medium cursor-pointer"
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
