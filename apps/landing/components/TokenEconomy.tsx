"use client";

import { useState } from "react";
import { CreditCard, Fuel, Vote, Wrench, Plug2, Lock, TrendingUp, DollarSign, Handshake } from "lucide-react";

export default function TokenEconomy() {
  const [activeUtility, setActiveUtility] = useState<number | null>(null);

  const tokenUtilities = [
    {
      title: "Subscription Payments",
      description: "All SaaS plans across NorChain applications are billed in NOR",
      Icon: CreditCard,
      color: "from-green-400 to-emerald-500",
      examples: ["NorPay Pro: 50 NOR/mo", "NorLedger: 100 NOR/mo", "NorChat Business: 10 NOR/user/mo"],
      volume: "~40% of total demand"
    },
    {
      title: "Transaction Fees",
      description: "Gas fees for all blockchain operations and smart contract interactions",
      Icon: Fuel,
      color: "from-blue-400 to-cyan-500",
      examples: ["Transfer: <0.001 NOR", "Smart contract: ~0.01 NOR", "Bridge operation: 0.25% fee"],
      volume: "~25% of total demand"
    },
    {
      title: "Staking & Governance",
      description: "Validators stake NOR to secure the network and participate in governance",
      Icon: Vote,
      color: "from-purple-400 to-violet-500",
      examples: ["Minimum stake: 1,000 NOR", "Proposal threshold: 5,000 NOR", "Annual rewards: ~8-12%"],
      volume: "~20% of total supply"
    },
    {
      title: "Developer Rewards",
      description: "Ecosystem grants and revenue sharing for developers and contributors",
      Icon: Wrench,
      color: "from-orange-400 to-amber-500",
      examples: ["SDK usage rewards", "Marketplace rev share: 90/10", "Bug bounties up to 10,000 NOR"],
      volume: "~10% distributed monthly"
    },
    {
      title: "API Access Tiers",
      description: "Premium features and higher quotas unlocked with staked NOR",
      Icon: Plug2,
      color: "from-indigo-400 to-blue-500",
      examples: ["Standard: Free tier", "Pro: 100 NOR staked", "Enterprise: 1,000 NOR staked"],
      volume: "~5% utility staking"
    },
    {
      title: "Collateralization",
      description: "Used to secure bridges, escrow, and B2B service guarantees",
      Icon: Lock,
      color: "from-red-400 to-pink-500",
      examples: ["Bridge deposits", "Service guarantees", "Escrow contracts"],
      volume: "Variable based on usage"
    }
  ];

  const revenueFlows = [
    { source: "Subscription Fees", allocation: 40, color: "bg-green-500" },
    { source: "Transaction Fees", allocation: 25, color: "bg-blue-500" },
    { source: "Trading Fees", allocation: 20, color: "bg-purple-500" },
    { source: "API Usage", allocation: 10, color: "bg-orange-500" },
    { source: "Other Services", allocation: 5, color: "bg-indigo-500" }
  ];

  const distributionModel = [
    { recipient: "Treasury (DAO)", percentage: 40, description: "Community controlled funds for ecosystem development" },
    { recipient: "Validators", percentage: 25, description: "Network security rewards and staking incentives" },
    { recipient: "Developers", percentage: 20, description: "Ecosystem grants and revenue sharing programs" },
    { recipient: "Innovation Fund", percentage: 10, description: "AI research and new technology development" },
    { recipient: "ESG/Charity", percentage: 5, description: "Environmental and social impact initiatives" }
  ];

  return (
    <section id="token-economy" className="py-20 bg-gradient-to-b from-black via-gray-950 to-black scroll-mt-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-[600px] h-[600px] bg-gradient-to-br from-yellow-500/10 via-orange-500/15 to-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-gradient-to-tl from-green-500/10 via-emerald-500/15 to-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(234,179,8,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(234,179,8,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-24">
          <div className="relative inline-block mb-8">
            <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white">
              Token Economy
            </h2>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1.5 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-full" />
          </div>
          <p className="text-lg sm:text-2xl text-gray-400 font-light max-w-4xl mx-auto leading-relaxed mb-8">
            NOR powers every transaction, subscription, and service across the ecosystem
          </p>
          
          {/* Key Concept */}
          <div className="inline-flex items-center gap-4 bg-gradient-to-r from-yellow-900/60 via-orange-900/60 to-red-900/60 backdrop-blur-xl border border-yellow-700/50 px-8 py-4 rounded-2xl shadow-lg">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-yellow-400 rounded-full animate-pulse"></div>
              <div className="h-3 w-3 bg-orange-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <div className="h-3 w-3 bg-red-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
            <span className="text-yellow-200 font-bold text-lg">
              Everything as SaaS, Everything in NOR
            </span>
          </div>
        </div>

        {/* Token Utilities */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Utility & Demand Drivers
            </h3>
            <p className="text-gray-400 max-w-3xl mx-auto">
              Six core utilities create sustainable demand for NOR tokens across the ecosystem
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {tokenUtilities.map((utility, index) => (
              <div
                key={utility.title}
                className="group relative"
                onMouseEnter={() => setActiveUtility(index)}
                onMouseLeave={() => setActiveUtility(null)}
              >
                {/* Utility Card */}
                <div className="relative bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 h-full transition-all duration-500 hover:bg-gray-900/60 hover:border-gray-600/70 hover:transform hover:scale-105 hover:-translate-y-2 shadow-2xl hover:shadow-3xl cursor-pointer">

                  {/* Dynamic gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${utility.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`} />

                  {/* Volume Badge */}
                  <div className="flex justify-end mb-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 border border-gray-700/50 rounded-lg">
                      <div className="text-xs text-gray-500 font-medium">Volume:</div>
                      <div className="text-sm font-bold text-yellow-400">{utility.volume}</div>
                    </div>
                  </div>

                  {/* Icon and Title in one line */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-shrink-0">
                      <div className={`absolute -inset-1 bg-gradient-to-br ${utility.color} rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
                      <div className={`relative h-14 w-14 bg-gradient-to-br ${utility.color} rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-all duration-500`}>
                        <utility.Icon className="h-7 w-7 text-white" strokeWidth={2} />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors duration-300">
                      {utility.title}
                    </h3>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <p className="text-base text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                      {utility.description}
                    </p>

                    {/* Examples */}
                    {activeUtility === index && (
                      <div className="space-y-3 animate-fadeInUp">
                        <div className="text-sm text-gray-500 font-semibold">Examples:</div>
                        <div className="space-y-2">
                          {utility.examples.map((example, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                              <div className="h-1.5 w-1.5 bg-yellow-400 rounded-full flex-shrink-0"></div>
                              <span>{example}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom accent line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${utility.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-3xl`} />
                </div>

                {/* Floating indicators */}
                <div className={`absolute -top-2 -right-2 w-3 h-3 bg-gradient-to-r ${utility.color} rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-700 animate-pulse`} style={{animationDelay: `${index * 200}ms`}} />
                <div className={`absolute -bottom-2 -left-2 w-2 h-2 bg-gradient-to-r ${utility.color} rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-700 animate-pulse`} style={{animationDelay: `${index * 300}ms`}} />
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Distribution */}
        <div className="grid lg:grid-cols-2 gap-12 mb-24">
          {/* Revenue Sources */}
          <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6">Revenue Sources</h3>
            <div className="space-y-4">
              {revenueFlows.map((flow, index) => (
                <div key={flow.source} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">{flow.source}</span>
                      <span className="text-gray-400 text-sm">{flow.allocation}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${flow.color} transition-all duration-1000 ease-out`}
                        style={{ width: `${flow.allocation}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Distribution Model */}
          <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6">Distribution Model</h3>
            <div className="space-y-6">
              {distributionModel.map((item, index) => (
                <div key={item.recipient} className="border-b border-gray-700/30 pb-4 last:border-b-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium">{item.recipient}</span>
                    <span className="text-yellow-400 font-bold">{item.percentage}%</span>
                  </div>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-12 shadow-2xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Self-Sustaining Economy
            </h3>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              A tokenomic model designed for long-term sustainability and organic growth
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Organic Growth",
                desc: "Token demand grows naturally with ecosystem adoption",
                Icon: TrendingUp,
                color: "from-green-400 to-emerald-500"
              },
              {
                title: "Utility Focus",
                desc: "NOR is primarily utility, not speculative investment",
                Icon: Wrench,
                color: "from-blue-400 to-cyan-500"
              },
              {
                title: "Revenue Backed",
                desc: "Token value supported by real business revenue",
                Icon: DollarSign,
                color: "from-yellow-400 to-orange-500"
              },
              {
                title: "Aligned Incentives",
                desc: "All participants benefit from ecosystem growth",
                Icon: Handshake,
                color: "from-purple-400 to-violet-500"
              }
            ].map((benefit, index) => (
              <div key={index} className="group relative">
                <div className="relative bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 h-full transition-all duration-300 hover:bg-gray-800/60 hover:border-gray-600/70 hover:transform hover:scale-105">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-shrink-0">
                      <div className={`absolute -inset-1 bg-gradient-to-br ${benefit.color} rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300`} />
                      <div className={`relative h-14 w-14 bg-gradient-to-br ${benefit.color} rounded-xl flex items-center justify-center shadow-lg`}>
                        <benefit.Icon className="w-7 h-7 text-white" strokeWidth={2} />
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors duration-300">
                      {benefit.title}
                    </h4>
                  </div>
                  <p className="text-base text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                    {benefit.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-40 left-40 w-3 h-3 bg-yellow-400 rounded-full animate-pulse opacity-60" />
        <div className="absolute top-60 right-32 w-2 h-2 bg-orange-400 rounded-full animate-pulse opacity-50" style={{animationDelay: '1s'}} />
        <div className="absolute bottom-40 left-20 w-4 h-4 bg-red-400 rounded-lg rotate-45 animate-pulse opacity-40" style={{animationDelay: '2s'}} />
        <div className="absolute bottom-60 right-40 w-2 h-2 bg-green-400 rounded-full animate-pulse opacity-60" style={{animationDelay: '3s'}} />
      </div>
    </section>
  );
}