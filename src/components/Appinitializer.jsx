import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

const AppInitializer = ({ children }) => {
  const {
    token,
    appLoading,
    loading,
    business
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {

    if (
      !appLoading &&
      !loading &&
      token
    ) {

      const isAuthRoute =
        location.pathname === '/login' ||
        location.pathname === '/signup';

      const isBusinessRoute =
        location.pathname === '/business-details';

      if (
        !business &&
        !isBusinessRoute &&
        !isAuthRoute
      ) {

        navigate('/business-details');

      }

    }

  }, [
    appLoading,
    loading,
    business,
    token,
    navigate,
    location
  ]);

  if (appLoading) {
    return (
      <LoadingScreen
        message="Loading Business Details..."
        progress={80}
      />
    );
  }

  return children;
};

export default AppInitializer;