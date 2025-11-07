'use client';

import { useEffect, useState } from 'react';

interface LiveCounterProps {
  readonly value: number;
  readonly label: string;
  readonly prefix?: string;
  readonly suffix?: string;
  readonly decimals?: number;
  readonly animate?: boolean;
}

export const LiveCounter = ({
  value,
  label,
  prefix = '',
  suffix = '',
  decimals = 0,
  animate = true,
}: LiveCounterProps): JSX.Element => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      setIsUpdating(true);

      if (animate) {
        // Smooth animation from old to new value
        const duration = 500; // ms
        const steps = 20;
        const stepValue = (value - displayValue) / steps;
        let currentStep = 0;

        const interval = setInterval(() => {
          currentStep++;
          if (currentStep <= steps) {
            setDisplayValue(prev => prev + stepValue);
          } else {
            setDisplayValue(value);
            clearInterval(interval);
            setTimeout(() => setIsUpdating(false), 200);
          }
        }, duration / steps);

        return () => clearInterval(interval);
      } else {
        setDisplayValue(value);
        setTimeout(() => setIsUpdating(false), 200);
      }
    }
  }, [value, displayValue, animate]);

  const formattedValue = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toLocaleString();

  return (
    <div className="relative inline-flex items-center gap-3">
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1">
          {prefix && (
            <span className="text-2xl font-medium opacity-80">
              {prefix}
            </span>
          )}
          <span
            className={`text-5xl md:text-6xl font-bold tabular-nums transition-all duration-300 ${
              isUpdating ? 'scale-105' : ''
            }`}
          >
            {formattedValue}
          </span>
          {suffix && (
            <span className="text-2xl font-medium opacity-80">
              {suffix}
            </span>
          )}
        </div>
        {label && (
          <span className="text-sm font-medium opacity-80 mt-1">
            {label}
          </span>
        )}
      </div>

      {isUpdating && (
        <div className="absolute -right-2 top-2">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-300"></span>
          </div>
        </div>
      )}
    </div>
  );
};
