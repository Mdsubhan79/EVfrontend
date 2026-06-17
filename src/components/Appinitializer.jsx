import React from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

const AppInitializer = ({ children }) => {

  const { token, appLoading } = useAuth();

  if (token && appLoading) {
    return (
      <LoadingScreen
        message="Loading EV Billing System..."
        progress={90}
      />
    );
  }

  return children;
};

export default AppInitializer;