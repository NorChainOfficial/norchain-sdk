'use client';

import React from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changePositive?: boolean;
  icon?: React.ReactNode;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changePositive = true,
  icon,
}) => {
  return (
    <div className="glass-card p-6 hover:bg-surface-hover transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm text-tertiary mb-2 font-medium">{title}</p>
          <h3 className="text-2xl font-semibold text-primary">{value}</h3>
        </div>
        {icon && (
          <div className="text-accent">
            {icon}
          </div>
        )}
      </div>
      {change && (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
          changePositive ? 'bg-success-bg text-success' : 'bg-error-bg text-error'
        }`}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={changePositive ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
          </svg>
          {change}
        </div>
      )}
    </div>
  );
};

