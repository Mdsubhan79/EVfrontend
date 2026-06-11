import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">

      <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>

      <h2 className="mt-5 text-lg font-semibold">
        Loading System...
      </h2>

    </div>
  );
}