import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export const usePreloadData = (token) => {
  const [business, setBusiness] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Initializing...');

  useEffect(() => {
    if (token) {
      preloadAllData();
    } else {
      setLoading(false);
    }
  }, [token]);

  const preloadAllData = async () => {
    setLoading(true);
    setProgress(0);
    
    try {
      // Step 1: Check authentication
      setMessage('Verifying authentication...');
      setProgress(5);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Step 2: Load business details
      setMessage('Loading business details...');
      setProgress(15);
      let businessData = null;
      try {
        const businessRes = await axios.get('https://evbackend-3jlc.onrender.com/api/business/details', {
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
      
      // Step 3: Load all bills
      setMessage('Loading your bills...');
      setProgress(50);
      let billsData = [];
      try {
        const billsRes = await axios.get('https://evbackend-3jlc.onrender.com/api/bills/all', {
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

  const refreshData = async () => {
    if (token) {
      await preloadAllData();
      toast.success('Data refreshed successfully!');
    }
  };

  return {
    business,
    bills,
    loading,
    progress,
    message,
    refreshData,
    preloadAllData
  };
};