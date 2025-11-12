'use client';

import { usePredictGas } from '@/hooks/useAI';
import { TrendingUp, TrendingDown, Minus, Loader2, Zap } from 'lucide-react';

interface GasPredictionWidgetProps {
  className?: string;
}

export function GasPredictionWidget({ className = '' }: GasPredictionWidgetProps) {
  const { data: prediction, isLoading, error } = usePredictGas();

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
        <p className="text-sm text-red-400">Failed to load gas prediction</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Loading gas prediction...</span>
        </div>
      </div>
    );
  }

  if (!prediction) return null;

  const getTrendIcon = () => {
    switch (prediction.trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-orange-400" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-green-400" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    switch (prediction.trend) {
      case 'increasing':
        return 'text-orange-400';
      case 'decreasing':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Gas Prediction
          </h3>
        </div>
        <div className="flex items-center gap-1">
          {getTrendIcon()}
          <span className={`text-xs font-medium capitalize ${getTrendColor()}`}>
            {prediction.trend}
          </span>
        </div>
      </div>

      <div className="mb-3">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {prediction.predictedGasPrice} Gwei
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          Confidence: {Math.round(prediction.confidence * 100)}%
        </div>
      </div>

      {prediction.recommendation && (
        <div className="p-2 bg-blue-400/10 rounded-lg">
          <p className="text-xs text-gray-700 dark:text-gray-300">
            {prediction.recommendation}
          </p>
        </div>
      )}
    </div>
  );
}

