import React, { createContext, useContext } from 'react';
import { usePreloadData } from '../hooks/usePreloadData';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children, token }) => {
  const {
    business,
    bills,
    loading,
    progress,
    message,
    refreshData
  } = usePreloadData(token);

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