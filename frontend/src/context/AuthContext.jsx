import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set base URL for axios
  axios.defaults.baseURL = 'https://schoolsys-yr1l.onrender.com/api';

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);
      // Set default auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    try {
      const { data } = await axios.post('/auth/login', { email, password, role });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      toast.success(`Logged in as ${role}`);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out');
  };

  const registerAdmin = async (name, email, password) => {
    try {
       await axios.post('/auth/register-admin', { name, email, password });
       // Auto login after register? Or redirect to login. Let's redirect to login for now or auto-login.
       // For this flow, let's just return true.
       toast.success('Admin registered successfully');
       return true;
    } catch (error) {
        toast.error(error.response?.data?.message || 'Registration failed');
        return false;
    }
  }

  const updateUserProfile = (updatedUser) => {
      // Merge new data with existing user data
      const newUser = { ...user, ...updatedUser };
      setUser(newUser);
      localStorage.setItem('userInfo', JSON.stringify(newUser));
  };

  const value = {
    user,
    login,
    logout,
    registerAdmin,
    updateUserProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
