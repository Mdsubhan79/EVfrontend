// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { token, appLoading, loading } = useAuth();


  if (appLoading || loading) {
    return null;
  }

  if (!token) {
    return <Navigate to="/login" />;
  }


  return children;
};

export default PrivateRoute;