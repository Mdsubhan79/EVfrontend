// src/components/LoadingScreen.jsx
import React from 'react';
import { BoltIcon } from '@heroicons/react/24/solid';

const LoadingScreen = ({ message = "Loading your dashboard...", progress = 0 }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-50 via-white to-blue-50 z-50 flex items-center justify-center">
      <div className="text-center px-4">
        {/* Animated Logo */}
        <div className="relative mb-8">
          <div className="animate-pulse">
            <BoltIcon className="h-20 w-20 text-green-600 mx-auto" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-24 w-24 rounded-full border-4 border-green-200 border-t-green-600 animate-spin"></div>
          </div>
        </div>
        
        {/* Loading Text */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          EV Billing System
        </h2>
        <p className="text-gray-600 mb-4">{message}</p>
        
        {/* Progress Bar */}
        <div className="w-64 mx-auto bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {/* Progress Percentage */}
        <p className="text-sm text-gray-500 mt-2">{Math.round(progress)}%</p>
        
        {/* Loading Tips */}
        <div className="mt-8 text-sm text-gray-500 max-w-md mx-auto">
          <p className="animate-pulse">⚡ Please wait while we prepare your dashboard...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;