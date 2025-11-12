'use client';

import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
  width?: string;
  height?: string;
}

export function LoadingSkeleton({ className = '', lines = 1, width, height }: LoadingSkeletonProps): JSX.Element {
  if (lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-slate-700 rounded animate-pulse"
            style={{ width: width || (i === lines - 1 ? '75%' : '100%') }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`bg-slate-700 rounded animate-pulse ${className}`}
      style={{ width: width || '100%', height: height || '1rem' }}
    />
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }): JSX.Element {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <LoadingSkeleton key={i} height="1.5rem" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <LoadingSkeleton key={colIndex} height="1rem" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton(): JSX.Element {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 animate-pulse">
      <LoadingSkeleton height="1.5rem" width="40%" className="mb-4" />
      <LoadingSkeleton lines={3} className="mb-4" />
      <LoadingSkeleton height="2rem" width="30%" />
    </div>
  );
}

export function BlockSkeleton(): JSX.Element {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <LoadingSkeleton height="1.25rem" width="20%" />
        <LoadingSkeleton height="1.25rem" width="15%" />
      </div>
      <div className="space-y-2">
        <LoadingSkeleton height="1rem" width="60%" />
        <LoadingSkeleton height="1rem" width="40%" />
      </div>
    </div>
  );
}

export function TransactionSkeleton(): JSX.Element {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <LoadingSkeleton height="1.25rem" width="30%" />
        <LoadingSkeleton height="1.25rem" width="15%" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <LoadingSkeleton height="1rem" width="50%" />
          <LoadingSkeleton height="1rem" width="70%" />
        </div>
        <div className="space-y-2">
          <LoadingSkeleton height="1rem" width="50%" />
          <LoadingSkeleton height="1rem" width="60%" />
        </div>
      </div>
    </div>
  );
}

