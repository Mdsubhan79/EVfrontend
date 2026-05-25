// frontend/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Menu, Transition } from '@headlessui/react';
import { UserCircleIcon, DocumentTextIcon, CogIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { BoltIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [business, setBusiness] = useState(null);
  const [showBillingForm, setShowBillingForm] = useState(false);

  useEffect(() => {
    fetchBusinessDetails();
  }, []);

  const fetchBusinessDetails = async () => {
    try {
      const token = localStorage.getItem('token');

const response = await axios.get(
  'https://evbackend-3jlc.onrender.com/api/business/details',
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);
      setBusiness(response.data);
    } catch (error) {
      console.log('No business details found');
    }
  };

   const handleStartBilling = () => {
  console.log("Button Clicked");
  navigate('/create-bill');
};

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {business?.logo ? (
                <img src={business.logo} alt="Logo" className="h-10 w-auto" />
              ) : (
                <BoltIcon className="h-10 w-10 text-green-600" />
              )}
              <span className="ml-3 text-xl font-bold text-gray-800">
                {business?.businessName || 'EV Billing'}
              </span>
            </div>
            
            <div className="flex items-center">
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-2 focus:outline-none">
                  <UserCircleIcon className="h-10 w-10 text-gray-600 hover:text-gray-800" />
                </Menu.Button>
                
                <Transition
                  enter="transition duration-100 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-75 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900">{business?.businessName || 'Business Name'}</p>
                    </div>
                    
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => navigate('/business-details')}
                          className={`${active ? 'bg-gray-100' : ''} flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                        >
                          <CogIcon className="h-5 w-5 mr-2" />
                          Settings
                        </button>
                      )}
                    </Menu.Item>
                    
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => navigate('/bills')}
                          className={`${active ? 'bg-gray-100' : ''} flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                        >
                          <DocumentTextIcon className="h-5 w-5 mr-2" />
                          All Bills
                        </button>
                      )}
                    </Menu.Item>
                    
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={logout}
                          className={`${active ? 'bg-gray-100' : ''} flex items-center w-full px-4 py-2 text-sm text-red-600 border-t`}
                        >
                          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                          Logout
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to {business?.businessName || 'EV Billing System'}
          </h1>
          <p className="text-lg text-gray-600 mb-8">{business?.tagline}</p>
          
          <button
            onClick={handleStartBilling}
            className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition duration-200 transform hover:scale-105"
          >
            Start Billing
          </button>
        </div>
        
        {/* Quick Stats or Recent Bills can be added here */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Quick Tip</h3>
            <p className="text-gray-600">Click "Start Billing" to create a new invoice for your customer</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Support</h3>
            <p className="text-gray-600">For any queries, contact your EV billing support team</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">GST Ready</h3>
            <p className="text-gray-600">All invoices are GST compliant with proper tax calculations</p>
          </div>
        </div>
      </div>
    </div>
  );
}