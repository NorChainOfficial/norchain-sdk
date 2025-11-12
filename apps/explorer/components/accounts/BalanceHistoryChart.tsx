'use client';

import React from 'react';

interface BalanceHistoryChartProps {
  address: string;
  balanceHistory?: Array<{
    timestamp: number;
    balance: string;
  }>;
}

export function BalanceHistoryChart({ address, balanceHistory }: BalanceHistoryChartProps): JSX.Element {
  // For now, show a placeholder chart
  // In production, this would use a charting library like Recharts or Chart.js
  // and fetch historical balance data from the API

  if (!balanceHistory || balanceHistory.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Balance History</h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm">Balance history data will be available soon</p>
            <p className="text-xs text-gray-500 mt-1">Historical balance tracking is coming in a future update</p>
          </div>
        </div>
      </div>
    );
  }

  // Simple line chart visualization
  const maxBalance = Math.max(...balanceHistory.map((h) => parseFloat(h.balance)));
  const minBalance = Math.min(...balanceHistory.map((h) => parseFloat(h.balance)));
  const range = maxBalance - minBalance || 1;

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Balance History (Last 30 Days)</h3>
      <div className="h-64 relative">
        <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            points={balanceHistory.map((h, i) => {
              const x = (i / (balanceHistory.length - 1)) * 400;
              const y = 200 - ((parseFloat(h.balance) - minBalance) / range) * 180;
              return `${x},${y}`;
            }).join(' ')}
          />
        </svg>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
        <span>Min: {minBalance.toFixed(4)} NOR</span>
        <span>Max: {maxBalance.toFixed(4)} NOR</span>
      </div>
    </div>
  );
}

