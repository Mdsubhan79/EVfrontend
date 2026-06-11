// frontend/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);
const [bills, setBills] = useState([]);
const [appLoading, setAppLoading] = useState(true);

  axios.defaults.baseURL = 'https://evbackend-3jlc.onrender.com/api';

useEffect(() => {

  const loadInitialData = async () => {

    if (!token) {
      setLoading(false);
      setAppLoading(false);
      return;
    }

    try {

      axios.defaults.headers.common['Authorization'] =
        `Bearer ${token}`;

      const [businessRes, billsRes] =
        await Promise.all([

          axios.get('/business/details'),

          axios.get('/bills/all')

        ]);

      setBusiness(businessRes.data);

      setBills(billsRes.data);

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);
      setAppLoading(false);

    }

  };

  loadInitialData();

}, [token]);

  const login = async (phoneNumber, password) => {
    try {
      const response = await axios.post('/auth/login', { phoneNumber, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setToken(token);
      setUser(user);
      toast.success('Login successful!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const signup = async (name, phoneNumber, password) => {
    try {
      const response = await axios.post('/auth/signup', { name, phoneNumber, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setToken(token);
      setUser(user);
      toast.success('Signup successful!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{
  user,
  token,
  login,
  signup,
  logout,

  loading,
  appLoading,

  business,
  setBusiness,

  bills,
  setBills
}}>
      {children}
    </AuthContext.Provider>
  );
};