// frontend/src/context/AuthContext.jsx
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

  

  const login = async (phoneNumber, password) => {
    try {
      const response = await axios.post('/auth/login', { phoneNumber, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setToken(token);
      setUser(user);
      
      // Show loading while fetching data after login
      setAppLoading(true);
      
      try {
        await new Promise(resolve =>
            setTimeout(resolve, 1500)
          );
        const [businessRes, billsRes] = await Promise.all([
          axios.get('/business/details'),
          axios.get('/bills/all')
        ]);
        setBusiness(businessRes.data);
        setBills(billsRes.data);
      } catch (err) {
        console.log('Error fetching data after login:', err);
      } finally {
        setAppLoading(false);
      }
      
      toast.success('Login successful!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      setAppLoading(false);
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
    setBusiness(null);
    setBills([]);
    toast.success('Logged out successfully');
  };

  const refreshData = async () => {
    if (!token) return;
    
    setAppLoading(true);
    try {
      const [businessRes, billsRes] = await Promise.all([
        axios.get('/business/details'),
        axios.get('/bills/all')
      ]);
      setBusiness(businessRes.data);
      setBills(billsRes.data);
      toast.success('Data refreshed!');
    } catch (err) {
      toast.error('Failed to refresh data');
    } finally {
      setAppLoading(false);
    }
  };

  // Calculate dashboard 
  const dashboardStats = {
    totalBills: bills.length,
    totalRevenue: bills.reduce((sum, bill) => sum + (bill.grandTotal || 0), 0),
    todayBills: bills.filter(bill => {
      const today = new Date().toDateString();
      return new Date(bill.createdAt).toDateString() === today;
    }).length,
    thisMonthBills: bills.filter(bill => {
      const now = new Date();
      const billDate = new Date(bill.createdAt);
      return billDate.getMonth() === now.getMonth() && 
             billDate.getFullYear() === now.getFullYear();
    }).length,
    recentBills: bills.slice(0, 10),
  };

  return (
    <AuthContext.Provider value={{
  user,
  token,

  business,
  bills,

  loading,
  appLoading,

  login,
  signup,
  logout
}}>
      {children}
    </AuthContext.Provider>
  );
};