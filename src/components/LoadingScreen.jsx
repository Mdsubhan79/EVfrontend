// src/components/LoadingScreen.jsx
import React, { useState, useEffect } from 'react';
import { BoltIcon } from '@heroicons/react/24/solid';

const LoadingScreen = ({ message = "Loading your dashboard...", progress = 0 }) => {
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(message);

  useEffect(() => {
    // If real progress is provided, use it
    if (progress > 0) {
      setCurrentProgress(progress);
      setCurrentMessage(message);
      return;
    }

    // Simulate progress
    const messages = [
      "Loading your dashboard...",
      "Fetching business details...",
      "Loading your bills...",
      "Almost there...",
      "Preparing your workspace..."
    ];

    let messageIndex = 0;
    
    const interval = setInterval(() => {
      setCurrentProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 400);

    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setCurrentMessage(messages[messageIndex]);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(messageInterval);
    };
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

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          EG Billing
        </h2>
        
        {/* Loading Message */}
        <p className="text-gray-600 mb-4">{currentMessage}</p>

        {/* Progress Bar */}
        <div className="w-64 mx-auto bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(currentProgress, 100)}%` }}
          ></div>
        </div>

        {/* Progress Percentage */}
        <p className="text-sm text-gray-500 mt-2">
          {Math.round(Math.min(currentProgress, 100))}%
        </p>

        {/* Loading Tip */}
        <div className="mt-8 text-sm text-gray-500 max-w-md mx-auto">
          <p className="animate-pulse">
            ⚡ Please wait while dashboard is preparing...
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
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