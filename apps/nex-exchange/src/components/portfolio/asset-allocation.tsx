"use client";

import { useMemo } from 'react';

interface Asset {
  readonly symbol: string;
  readonly value: number;
  readonly change24h: number;
}

interface AssetAllocationProps {
  readonly assets: Asset[];
}

export const AssetAllocation = ({ assets }: AssetAllocationProps): JSX.Element => {
  const totalValue = useMemo(() => {
    return assets.reduce((sum, asset) => sum + asset.value, 0);
  }, [assets]);

  const assetsWithPercentage = useMemo(() => {
    return assets.map(asset => ({
      ...asset,
      percentage: (asset.value / totalValue) * 100,
    }));
  }, [assets, totalValue]);

  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-yellow-500',
    'bg-pink-500',
    'bg-indigo-500',
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Asset Allocation</h3>

      {/* Pie Chart Visual */}
      <div className="flex items-center justify-center">
        <div className="relative w-48 h-48">
          {/* Simple stacked circle representation */}
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            {assetsWithPercentage.reduce((acc, asset, index) => {
              const startAngle = acc.angle;
              const angle = (asset.percentage / 100) * 360;
              const endAngle = startAngle + angle;

              const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
              const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);

              const largeArc = angle > 180 ? 1 : 0;

              const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;

              acc.paths.push(
                <path
                  key={asset.symbol}
                  d={pathData}
                  className={colors[index % colors.length]}
                  opacity={0.8}
                />
              );

              acc.angle = endAngle;
              return acc;
            }, { angle: 0, paths: [] as JSX.Element[] }).paths}
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {assetsWithPercentage.map((asset, index) => (
          <div
            key={asset.symbol}
            className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border"
          >
            <div className="flex items-center space-x-3">
              <div className={`h-3 w-3 rounded-full ${colors[index % colors.length]}`} />
              <div>
                <div className="font-semibold">{asset.symbol}</div>
                <div className="text-sm text-foreground/70">
                  {asset.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">
                {asset.value.toLocaleString('no-NO', {
                  style: 'currency',
                  currency: 'NOK',
                })}
              </div>
              <div
                className={`text-sm ${
                  asset.change24h >= 0 ? 'text-success' : 'text-error'
                }`}
              >
                {asset.change24h >= 0 ? '+' : ''}
                {asset.change24h.toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
