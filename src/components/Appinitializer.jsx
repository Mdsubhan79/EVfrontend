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
   
    if (!appLoading && !loading && token) {
      const hasBusinessDetails = business && business.businessName;
      const isBusinessRoute = location.pathname === '/business-details';
      const isAuthRoute = 
        location.pathname === '/login' || 
        location.pathname === '/signup';

      if (!hasBusinessDetails && !isBusinessRoute && !isAuthRoute) {
        navigate('/business-details');
      }

      // Redirect to dashboard if business is set and user is on auth pages
      if (hasBusinessDetails && isAuthRoute) {
        navigate('/dashboard');
      }
    }
  }, [appLoading, loading, business, token, navigate, location]);

  if (appLoading || (token && loading)) {
    return (
      <LoadingScreen 
        message={
          appLoading 
            ? "Loading your dashboard..." 
            : "Checking authentication..."
        } 
        progress={appLoading ? 70 : 30} 
      />
    );
  }

  return children;
};

export default AppInitializer;