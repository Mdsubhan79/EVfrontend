import React from 'react';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext.jsx';

import PrivateRoute from './components/PrivateRoute.jsx';

import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import BusinessDetails from './pages/BusinessDetails.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CreateBill from './pages/CreateBill.jsx';
import BillDetails from './pages/BillDetails.jsx';
import AllBills from './pages/AllBills.jsx'; 
import EditBill from './pages/EditBill.jsx';

import './App.css';
import './index.css';
import './styles/invoice.css';
import './styles/responsive.css';
function App() {

  return (

    <Router>

      <AuthProvider>

        <div className="min-h-screen bg-gray-100">

          <Toaster position="top-right" />

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

            <Route
              path="/"
              element={<Navigate to="/dashboard" />}
            />

          </Routes>

        </div>

      </AuthProvider>

    </Router>

  );

}

export default App;