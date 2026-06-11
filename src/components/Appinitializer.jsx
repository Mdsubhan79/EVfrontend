// src/components/AppInitializer.jsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import LoadingScreen from './LoadingScreen';

const AppInitializer = ({ children }) => {
  const { token, loading: authLoading } = useAuth();
  const { loading: dataLoading, progress, message, business } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!authLoading && !dataLoading && token) {
      const hasBusinessDetails = business !== null;
      const isBusinessRoute = location.pathname === '/business-details';
      const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup';
      
      if (!hasBusinessDetails && !isBusinessRoute && !isAuthRoute) {
        navigate('/business-details');
      }
    }
  }, [authLoading, dataLoading, business, token, navigate, location]);

  // Show loading screen while data is being loaded
  if (authLoading || (token && dataLoading)) {
    return <LoadingScreen message={message} progress={progress} />;
  }

  return children;
};

export default AppInitializer;