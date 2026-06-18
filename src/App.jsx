// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AppInitializer from './components/Appinitializer';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BusinessDetails from './pages/BusinessDetails';
import Dashboard from './pages/Dashboard';
import CreateBill from './pages/CreateBill';
import BillDetails from './pages/BillDetails';
import AllBills from './pages/AllBills';
import EditBill from './pages/EditBill';
import './App.css';
import './index.css';
import './styles/invoice.css';
import './styles/responsive.css';

function App() {
  return (
    <Router>
      <AuthProvider>
       
          <AppInitializer>
            <div className="min-h-screen bg-gray-100">
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                }}
              />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                  path="/business-details"
                  element={
                    <PrivateRoute>
                      <BusinessDetails />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/create-bill"
                  element={
                    <PrivateRoute>
                      <CreateBill />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/bills"
                  element={
                    <PrivateRoute>
                      <AllBills />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/bill/:id"
                  element={
                    <PrivateRoute>
                      <BillDetails />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/edit-bill/:id"
                  element={
                    <PrivateRoute>
                      <EditBill />
                    </PrivateRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </div>
          </AppInitializer>
        
      </AuthProvider>
    </Router>
  );
}

export default App;