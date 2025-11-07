/**
 * Version Info Component
 * Shows app version and build information
 */

'use client';

import React from 'react';

export const VersionInfo: React.FC = () => {
  const version = '1.0.0';
  const buildDate = new Date().toLocaleDateString();

  return (
    <div className="text-center py-4">
      <p className="text-white/40 text-xs">
        Nor Wallet v{version}
      </p>
      <p className="text-white/30 text-xs mt-1">
        Built with Next.js & Supabase
      </p>
    </div>
  );
};

