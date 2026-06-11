// src/context/DataContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [business, setBusiness] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Initializing...');

  const API_URL = 'https://evbackend-3jlc.onrender.com';

  const preloadAllData = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setProgress(0);
    
    try {
      // Step 1: Verifying authentication
      setMessage('Verifying authentication...');
      setProgress(5);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Step 2: Loading business details
      setMessage('Loading business details...');
      setProgress(15);
      let businessData = null;
      try {
        const businessRes = await axios.get(`${API_URL}/api/business/details`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        businessData = businessRes.data;
        setBusiness(businessData);
        setProgress(40);
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.log('No business details found');
        setBusiness(null);
      }
      
      // Step 3: Loading all bills
      setMessage('Loading your bills...');
      setProgress(50);
      let billsData = [];
      try {
        const billsRes = await axios.get(`${API_URL}/api/bills/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        billsData = billsRes.data;
        setBills(billsData);
        setProgress(80);
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.log('No bills found');
        setBills([]);
      }
      
      // Step 4: Preparing dashboard
      setMessage('Preparing your dashboard...');
      setProgress(90);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Step 5: Complete
      setMessage('Ready!');
      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLoading(false);
      return { business: businessData, bills: billsData };
      
    } catch (error) {
      console.error('Error preloading data:', error);
      toast.error('Failed to load data. Please refresh the page.');
      setLoading(false);
      throw error;
    }
  };

  useEffect(() => {
    preloadAllData();
  }, []);

  const refreshData = async () => {
    await preloadAllData();
    toast.success('Data refreshed successfully!');
  };

  // Calculate dashboard statistics
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

  const value = {
    business,
    bills,
    loading,
    progress,
    message,
    dashboardStats,
    refreshData,
    isDataLoaded: !loading
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};