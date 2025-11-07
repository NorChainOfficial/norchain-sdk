/**
 * Health Check Page
 * Shows system status and connectivity
 */

'use client';

import React, { useState, useEffect } from 'react';
import { SupabaseService } from '@/lib/supabase-service';
import { TransactionService } from '@/lib/transaction-service';
import { getEnvConfig } from '@/lib/env-validation';

export default function HealthPage() {
  const [health, setHealth] = useState({
    supabase: false,
    rpc: false,
    storage: false,
    errors: [] as string[],
  });

  useEffect(() => {
    const checkHealth = async () => {
      const errors: string[] = [];
      const status = {
        supabase: false,
        rpc: false,
        storage: false,
        errors,
      };

      // Check Supabase
      try {
        const supabaseService = SupabaseService.getInstance();
        await supabaseService.checkSession();
        status.supabase = true;
      } catch (error: any) {
        status.supabase = false;
        errors.push(`Supabase: ${error.message}`);
      }

      // Check RPC
      try {
        const transactionService = TransactionService.getInstance();
        // Try to get gas price (simple RPC check)
        await transactionService.getAccountBalance(
          '0x0000000000000000000000000000000000000000',
          'xaheen'
        );
        status.rpc = true;
      } catch (error: any) {
        status.rpc = false;
        errors.push(`RPC: ${error.message}`);
      }

      // Check Storage
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('health_check', 'test');
          localStorage.removeItem('health_check');
          status.storage = true;
        }
      } catch (error: any) {
        status.storage = false;
        errors.push(`Storage: ${error.message}`);
      }

      setHealth(status);
    };

    checkHealth();
  }, []);

  const envConfig = getEnvConfig();

  return (
    <div className="min-h-screen bg-gradient-primary p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white mb-6">System Health</h1>

        {/* Environment */}
        <div className="glass-card p-6 rounded-2xl">
          <h2 className="text-xl font-semibold text-white mb-4">
            Environment Configuration
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-white/60">Supabase URL</span>
              <span className="text-white font-mono text-sm">
                {envConfig.supabaseUrl ? '✅ Set' : '❌ Not set'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Supabase Key</span>
              <span className="text-white font-mono text-sm">
                {envConfig.supabaseKey ? '✅ Set' : '❌ Not set'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Environment</span>
              <span className="text-white font-mono text-sm">
                {process.env.NODE_ENV || 'development'}
              </span>
            </div>
          </div>
        </div>

        {/* Service Status */}
        <div className="glass-card p-6 rounded-2xl">
          <h2 className="text-xl font-semibold text-white mb-4">
            Service Status
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white">Supabase</span>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    health.supabase ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="text-white/60 text-sm">
                  {health.supabase ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">RPC Endpoint</span>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    health.rpc ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="text-white/60 text-sm">
                  {health.rpc ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Local Storage</span>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    health.storage ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="text-white/60 text-sm">
                  {health.storage ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Errors */}
        {health.errors.length > 0 && (
          <div className="glass-card p-6 rounded-2xl bg-red-500/10 border border-red-500/20">
            <h2 className="text-xl font-semibold text-red-200 mb-4">
              Errors
            </h2>
            <ul className="space-y-2">
              {health.errors.map((error, index) => (
                <li key={index} className="text-red-200 text-sm">
                  • {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* All Good */}
        {health.errors.length === 0 &&
          health.supabase &&
          health.rpc &&
          health.storage && (
            <div className="glass-card p-6 rounded-2xl bg-green-500/10 border border-green-500/20 text-center">
              <p className="text-green-200 font-semibold text-lg">
                ✅ All systems operational!
              </p>
            </div>
          )}
      </div>
    </div>
  );
}

