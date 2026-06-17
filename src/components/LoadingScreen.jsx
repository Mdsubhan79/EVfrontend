// src/components/LoadingScreen.jsx
import React, { useState, useEffect } from 'react';
import { BoltIcon } from '@heroicons/react/24/solid';

const LoadingScreen = ({ message = "Loading your dashboard...", progress = 0 }) => {
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(message);

  useEffect(() => {
    // Simulate progress if no real progress is provided
    if (progress === 0) {
      const interval = setInterval(() => {
        setCurrentProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);
      
      const messageInterval = setInterval(() => {
        const messages = [
          "Loading your dashboard...",
          "Fetching business details...",
          "Loading your bills...",
          "Almost there...",
          "Preparing your workspace..."
        ];
        setCurrentMessage(messages[Math.floor(Math.random() * messages.length)]);
      }, 2000);
      
      return () => {
        clearInterval(interval);
        clearInterval(messageInterval);
      };
    } else {
      setCurrentProgress(progress);
      setCurrentMessage(message);
    }
  }, [progress, message]);

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
        <p className="text-gray-600 mb-4">{currentMessage}</p>
        
        {/* Progress Bar */}
        <div className="w-64 mx-auto bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${currentProgress}%` }}
          ></div>
        </div>
        
        {/* Progress Percentage */}
        <p className="text-sm text-gray-500 mt-2">{Math.round(currentProgress)}%</p>
        
        {/* Loading Tips */}
        <div className="mt-8 text-sm text-gray-500 max-w-md mx-auto">
          <p className="animate-pulse">Dashboard is being prepared...</p>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;