/**
 * Network Status Indicator
 * Shows connection status and Supabase connectivity
 */

'use client';

import React, { useState, useEffect } from 'react';
import { SupabaseService } from '@/lib/supabase-service';

export const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const supabaseService = SupabaseService.getInstance();

  useEffect(() => {
    // Monitor network status
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check Supabase connection
    const checkSupabase = async () => {
      try {
        await supabaseService.checkSession();
        setIsSupabaseConnected(true);
      } catch (error) {
        setIsSupabaseConnected(false);
      }
    };

    checkSupabase();
    const interval = setInterval(checkSupabase, 30000); // Check every 30s

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [supabaseService]);

  if (isOnline && isSupabaseConnected) {
    return null; // Don't show if everything is OK
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div className="glass-card px-4 py-2 rounded-lg flex items-center gap-2">
        {!isOnline && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-white text-sm">Offline</span>
          </div>
        )}
        {!isSupabaseConnected && isOnline && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white text-sm">Connection issue</span>
          </div>
        )}
      </div>
    </div>
  );
};

