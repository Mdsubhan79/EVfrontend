// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);        // true while checking auth
  const [business, setBusiness] = useState(null);
  const [bills, setBills] = useState([]);
  const [appLoading, setAppLoading] = useState(true);  // true until ALL data loaded

  axios.defaults.baseURL = 'https://evbackend-3jlc.onrender.com/api';

  // Load initial data whenever token changes
  useEffect(() => {
    const loadInitialData = async () => {
      if (!token) {
        // No token not logged in stop loading immediately
        setLoading(false);
        setAppLoading(false);
        setBusiness(null);
        setBills([]);
        return;
      }

      // Start loading state
      setLoading(true);
      setAppLoading(true);

      // Set authheader
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      try {
        // Fetch both business details and bills in parallel
        const [businessRes, billsRes] = await Promise.all([
          axios.get('/business/details'),
          axios.get('/bills/all')
        ]);
        setBusiness(businessRes.data);
        setBills(billsRes.data || []);
      } catch (err) {
        console.log('Error loading initial data:', err);
        
        
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setToken(null);
          setUser(null);
          setBusiness(null);
          setBills([]);
        }
        // For other errors, still set empty arrays to prevent null issues
        setBills([]);
      } finally {
        setLoading(false);
        setAppLoading(false); // <- only after everything is done
      }
    };

    loadInitialData();
  }, [token]);

  // Login function
  const login = async (phoneNumber, password) => {
    try {
      const response = await axios.post('/auth/login', { phoneNumber, password });
      const { token: newToken, user: newUser } = response.data;

      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setUser(newUser);

      // Show loading while we fetch business + bills after login
      setAppLoading(true);
      try {
        const [businessRes, billsRes] = await Promise.all([
          axios.get('/business/details'),
          axios.get('/bills/all')
        ]);
        setBusiness(businessRes.data);
        setBills(billsRes.data || []);
      } catch (err) {
        console.log('Error fetching data after login:', err);
        setBills([]);
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

  // Signup function
  const signup = async (name, phoneNumber, password) => {
    try {
      const response = await axios.post('/auth/signup', { name, phoneNumber, password });
      const { token: newToken, user: newUser } = response.data;

      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setUser(newUser);

      // After signup, show loading while fetching initial data
      setAppLoading(true);
      try {
        const [businessRes, billsRes] = await Promise.all([
          axios.get('/business/details'),
          axios.get('/bills/all')
        ]);
        setBusiness(businessRes.data);
        setBills(billsRes.data || []);
      } catch (err) {
        console.log('Error fetching data after signup:', err);
        setBills([]);
      } finally {
        setAppLoading(false);
      }

      toast.success('Signup successful!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
      setAppLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setBusiness(null);
    setBills([]);
    setLoading(false);
    setAppLoading(false);
    toast.success('Logged out successfully');
  };

  // Refresh data function
  const refreshData = async () => {
    if (!token) return;
    
    setAppLoading(true);
    try {
      const [businessRes, billsRes] = await Promise.all([
        axios.get('/business/details'),
        axios.get('/bills/all')
      ]);
      setBusiness(businessRes.data);
      setBills(billsRes.data || []);
      toast.success('Data refreshed!');
    } catch (err) {
      console.log('Error refreshing data:', err);
      toast.error('Failed to refresh data');
    } finally {
      setAppLoading(false);
    }
  };

  // Dashboard stats (computed)
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
      return billDate.getMonth() === now.getMonth() && billDate.getFullYear() === now.getFullYear();
    }).length,
    recentBills: bills.slice(0, 10),
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
      setBills,
      refreshData,
      dashboardStats,
    }}>
      {children}
    </AuthContext.Provider>
  );
};