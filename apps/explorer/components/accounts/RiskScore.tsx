'use client';

import React from 'react';

interface RiskScoreProps {
  address: string;
  riskScore?: number; // 0-100, where 0 is safe and 100 is high risk
  riskFactors?: string[];
}

export function RiskScore({ address, riskScore, riskFactors = [] }: RiskScoreProps): JSX.Element {
  // If no risk score provided, show placeholder
  if (riskScore === undefined) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Risk Score
        </h3>
        <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-300 text-sm mb-2">AI-powered risk assessment coming soon</p>
          <p className="text-yellow-400/80 text-xs">
            This feature will analyze transaction patterns, address history, and network behavior to provide a risk score.
          </p>
        </div>
      </div>
    );
  }

  const getRiskLevel = (score: number) => {
    if (score < 30) return { level: 'Low', color: 'text-green-400', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/30' };
    if (score < 70) return { level: 'Medium', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/30' };
    return { level: 'High', color: 'text-red-400', bgColor: 'bg-red-500/20', borderColor: 'border-red-500/30' };
  };

  const risk = getRiskLevel(riskScore);

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        Risk Score
      </h3>

      {/* Risk Score Display */}
      <div className={`p-4 ${risk.bgColor} border ${risk.borderColor} rounded-lg mb-4`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-2xl font-bold ${risk.color}`}>{riskScore}/100</span>
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${risk.bgColor} ${risk.color} border ${risk.borderColor}`}>
            {risk.level} Risk
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
          <div
            className={`h-2 rounded-full transition-all ${
              riskScore < 30 ? 'bg-green-500' : riskScore < 70 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${riskScore}%` }}
          />
        </div>
      </div>

      {/* Risk Factors */}
      {riskFactors.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-2">Risk Factors</h4>
          <ul className="space-y-1">
            {riskFactors.map((factor, index) => (
              <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
        <p className="text-xs text-gray-400">
          Risk score is calculated based on transaction patterns, address age, interaction history, and network behavior.
          Lower scores indicate safer addresses.
        </p>
      </div>
    </div>
  );
}

