// src/components/AppInitializer.jsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

const AppInitializer = ({ children }) => {
  const { token, appLoading, loading, business } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only check for business details after loading is complete
    if (!appLoading && !loading && token) {
      const hasBusinessDetails = business !== null;
      const isBusinessRoute = location.pathname === '/business-details';
      const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup';
      
      if (!hasBusinessDetails && !isBusinessRoute && !isAuthRoute) {
        navigate('/business-details');
      }
    }
  }, [appLoading, loading, business, token, navigate, location]);

  // Show loading screen while data is being loaded
  // This will show when appLoading is true (data is fetching)
  if (appLoading || (token && loading)) {
    return <LoadingScreen message="Loading your dashboard..." progress={appLoading ? 70 : 30} />;
  }

  return children;
};

export default AppInitializer;