import React from 'react';
import Link from 'next/link';
import { apiClient, formatAddress, formatNumber } from '@/lib/api-client';

export const revalidate = 3; // Revalidate every 3 seconds for live data

export default async function ValidatorsPage(): Promise<JSX.Element> {
  // Fetch validators data
  let validatorsData, stats;

  try {
    [validatorsData, stats] = await Promise.all([
      apiClient.getValidators(),
      apiClient.getStats(),
    ]);
  } catch (error) {
    console.error('Failed to fetch validators:', error);
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-100 mb-2">Error Loading Validators</h2>
          <p className="text-red-300">Failed to load validators data</p>
        </div>
      </div>
    );
  }

  const validators = validatorsData?.data || [];
  const totalVotingPower = validators.reduce((sum: number, v: any) => sum + Number(v.votingPower || v.voting_power || 0), 0);
  const activeValidators = validators.filter((v: any) =>
    (v.status === 'BOND_STATUS_BONDED' || v.status === 'active') && !v.jailed
  ).length;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-14 w-14 bg-green-600 rounded-xl flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Validators</h1>
            <p className="text-gray-400 mt-1">Active validators securing Nor Chain</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-400 text-sm uppercase tracking-wider">Total Validators</div>
              <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-white">{validators.length}</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-400 text-sm uppercase tracking-wider">Active Validators</div>
              <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-green-400">{activeValidators}</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-400 text-sm uppercase tracking-wider">Total Voting Power</div>
              <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-white">{formatNumber(totalVotingPower)}</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-400 text-sm uppercase tracking-wider">Status</div>
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div className="text-2xl font-bold text-green-400">LIVE</div>
          </div>
        </div>
      </div>

      {/* Validators Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Validator</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Address</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Voting Power</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Commission</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {validators.length > 0 ? validators.map((validator: any, index: number) => {
                const votingPower = Number(validator.votingPower || validator.voting_power || 0);
                const votingPowerPercentage = totalVotingPower > 0 ? ((votingPower / totalVotingPower) * 100).toFixed(2) : '0.00';
                const commission = validator.commissionRate || validator.commission_rate || '0.00';
                const isActive = (validator.status === 'BOND_STATUS_BONDED' || validator.status === 'active') && !validator.jailed;
                const moniker = validator.moniker || 'Unknown Validator';
                const operatorAddress = validator.operatorAddress || validator.operator_address || '';

                return (
                  <tr key={validator.id || index} className="hover:bg-slate-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white font-semibold">#{index + 1}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {moniker.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white font-medium">{moniker}</div>
                          {validator.website && (
                            <a
                              href={validator.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              {validator.website}
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-sm text-gray-300 font-mono">{formatAddress(operatorAddress)}</code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-white font-medium">{formatNumber(votingPower)}</div>
                      <div className="text-xs text-gray-400">{votingPowerPercentage}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-gray-300">{commission}%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {isActive ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-400 mr-2" />
                          Active
                        </span>
                      ) : validator.jailed ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                          <div className="h-1.5 w-1.5 rounded-full bg-red-400 mr-2" />
                          Jailed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
                          <div className="h-1.5 w-1.5 rounded-full bg-gray-400 mr-2" />
                          Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center space-y-3">
                      <svg className="h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <p className="text-lg">No validators found</p>
                      <p className="text-sm text-gray-500">Validators will appear here as they join the network</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">About Validators</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Validators are responsible for proposing and validating new blocks on the Nor Chain.
              They stake NOR tokens and receive rewards for their participation in consensus.
              Voting power is proportional to the amount of tokens staked. Active validators participate
              in block production, while inactive validators are not currently participating in consensus.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
