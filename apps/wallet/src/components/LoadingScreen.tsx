import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-primary">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-white/20 border-t-primary-light rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/60">Loading...</p>
      </div>
    </div>
  );
};

