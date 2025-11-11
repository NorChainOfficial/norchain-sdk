"use client";

import { useState } from "react";
import { Layers, Coins, Building2, Code2, CreditCard, PieChart, MessageSquare, RefreshCw, Landmark, Shield, Users, Gauge, Zap, TrendingUp, Lock, Globe, Sparkles, CheckCircle2 } from "lucide-react";
import { NumberTicker } from "./NumberTicker";

export default function NorChainOS() {
  const [activeLayer, setActiveLayer] = useState<number | null>(null);

  const osLayers = [
    {
      name: "Core",
      product: "NorChain L1",
      purpose: "Consensus + Execution",
      poweredBy: "Proof of Stake (PoS)",
      Icon: Gauge,
      color: "from-blue-500 to-cyan-500",
      description: "High-performance blockchain with 3-second finality and 10,000+ TPS capacity",
      features: ["PoS Consensus", "EVM Compatible", "Sub-cent fees", "Enterprise SLA"]
    },
    {
      name: "Gateway",
      product: "NorPay",
      purpose: "Payments, Billing, Subscriptions",
      poweredBy: "Smart Contracts + API",
      Icon: CreditCard,
      color: "from-green-500 to-emerald-500",
      description: "Complete payment infrastructure for Web3, like Stripe for blockchain",
      features: ["Hosted Checkout", "Recurring Billing", "Invoice System", "Merchant Portal"]
    },
    {
      name: "Economy",
      product: "NorLedger",
      purpose: "Accounting & ERP",
      poweredBy: "On-chain Anchored Books",
      Icon: PieChart,
      color: "from-purple-500 to-violet-500",
      description: "First blockchain-anchored accounting system with daily audit trails",
      features: ["Double-entry", "VAT/Tax", "Payroll", "Blockchain Proof"]
    },
    {
      name: "Social",
      product: "NorChat",
      purpose: "E2EE Messaging + Payments",
      poweredBy: "WebRTC + XMTP",
      Icon: MessageSquare,
      color: "from-pink-500 to-rose-500",
      description: "Web3 super messenger combining chat, calls, and seamless payments",
      features: ["End-to-end Encryption", "Voice/Video Calls", "In-chat Payments", "Business Profiles"]
    },
    {
      name: "DeFi",
      product: "Swap, NEX, DEX",
      purpose: "Markets + Liquidity",
      poweredBy: "AMM + Order Books",
      Icon: RefreshCw,
      color: "from-orange-500 to-amber-500",
      description: "Complete trading ecosystem from simple swaps to professional trading",
      features: ["AMM Swaps", "Order Books", "Limit Orders", "Portfolio Analytics"]
    },
    {
      name: "Governance",
      product: "DAO + Treasury",
      purpose: "Policy + Revenue Allocation",
      poweredBy: "On-chain Voting",
      Icon: Landmark,
      color: "from-indigo-500 to-blue-500",
      description: "Decentralized governance with transparent treasury management",
      features: ["Proposal System", "Token Voting", "Treasury Splits", "Revenue Sharing"]
    },
    {
      name: "Compliance",
      product: "NorPolicy + NorCompliance",
      purpose: "Trust + Regulation",
      poweredBy: "ML Risk Engine",
      Icon: Shield,
      color: "from-red-500 to-pink-500",
      description: "Enterprise-grade compliance for KYC/AML and regulatory requirements",
      features: ["Address Screening", "Travel Rule", "Case Management", "Audit Reports"]
    },
    {
      name: "Developer",
      product: "NorDev Portal",
      purpose: "Build + Monetize",
      poweredBy: "SDKs + Marketplace",
      Icon: Code2,
      color: "from-teal-500 to-cyan-500",
      description: "Complete developer ecosystem with APIs, SDKs, and monetization tools",
      features: ["API Playground", "SDK Library", "Usage Analytics", "Revenue Sharing"]
    }
  ];

  return (
    <section id="norchain-os" className="py-20 bg-gradient-to-b from-black via-gray-950 to-black scroll-mt-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-[600px] h-[600px] bg-gradient-to-br from-purple-500/10 via-blue-500/15 to-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-gradient-to-tl from-blue-500/10 via-purple-500/15 to-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-24">
          <div className="relative inline-block mb-8">
            <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white">
              NorChain OS
            </h2>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1.5 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-full" />
          </div>
          <p className="text-lg sm:text-2xl text-gray-400 font-light max-w-4xl mx-auto leading-relaxed mb-6">
            The complete blockchain operating system for digital commerce
          </p>
          <div className="inline-flex items-center gap-4 bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 px-6 py-3 rounded-2xl">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 bg-purple-400 rounded-full animate-pulse"></div>
              <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <div className="h-2 w-2 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
            <span className="text-white font-semibold">8 Integrated Layers</span>
          </div>
        </div>

        {/* OS Architecture */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-24">
          {osLayers.map((layer, index) => (
            <div
              key={layer.name}
              className="group relative"
              onMouseEnter={() => setActiveLayer(index)}
              onMouseLeave={() => setActiveLayer(null)}
            >
              {/* Layer Card */}
              <div className="relative bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 h-full transition-all duration-500 hover:bg-gray-900/60 hover:border-gray-600/70 hover:transform hover:scale-105 hover:-translate-y-2 shadow-2xl hover:shadow-3xl cursor-pointer">

                {/* Dynamic gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${layer.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`} />

                {/* Category Badge */}
                <div className="mb-6">
                  <div className="inline-block text-sm text-gray-500 font-medium tracking-wider uppercase px-3 py-1 bg-gray-800/50 rounded-lg border border-gray-700/50">
                    {layer.name}
                  </div>
                </div>

                {/* Icon and Title in one line */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-shrink-0">
                    <div className={`absolute -inset-1 bg-gradient-to-br ${layer.color} rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
                    <div className={`relative h-16 w-16 bg-gradient-to-br ${layer.color} rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-all duration-500`}>
                      <layer.Icon className="h-8 w-8 text-white" strokeWidth={2} />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors duration-300">
                    {layer.product}
                  </h3>
                </div>

                <div className="space-y-4">
                  <p className="text-base text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">
                    {layer.description}
                  </p>
                  <div className="text-sm text-gray-500">
                    <span className="font-semibold text-gray-400">Powered by:</span> {layer.poweredBy}
                  </div>
                </div>

                {/* Hover Features */}
                {activeLayer === index && (
                  <div className="absolute inset-x-4 -bottom-2 bg-gray-800/95 backdrop-blur-xl border border-gray-600/50 rounded-xl p-4 shadow-xl animate-fadeInUp">
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                      {layer.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 bg-cyan-400 rounded-full flex-shrink-0"></div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom accent line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${layer.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-3xl`} />
              </div>

              {/* Floating indicators */}
              <div className={`absolute -top-2 -right-2 w-3 h-3 bg-gradient-to-r ${layer.color} rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-700 animate-pulse`} />
              <div className={`absolute -bottom-2 -left-2 w-2 h-2 bg-gradient-to-r ${layer.color} rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-700 animate-pulse`} />
            </div>
          ))}
        </div>

        {/* Why NorChain OS? - Enhanced Section */}
        <div className="relative">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 rounded-3xl blur-3xl" />

          <div className="relative bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 sm:p-12 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-semibold text-purple-400">The Future of Digital Commerce</span>
              </div>

              <h3 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
                Why NorChain OS?
              </h3>
              <p className="text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
                The world's first complete blockchain operating system. Everything your business needs to operate on-chain, unified under one platform.
              </p>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
              {[
                { value: 8, suffix: "", label: "Integrated Applications", Icon: Layers },
                { value: 99.9, suffix: "%", label: "Platform Uptime", Icon: Zap, decimalPlaces: 1 },
                { value: 100, suffix: "%", label: "NOR Powered", Icon: Coins },
                { value: 127, suffix: "+", label: "Active Developers", Icon: Users }
              ].map((stat, idx) => (
                <div key={idx} className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 text-center">
                  <div className="flex justify-center mb-2">
                    <stat.Icon className="w-6 h-6 text-purple-400" strokeWidth={2} />
                  </div>
                  <div className="text-3xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-1">
                    <NumberTicker value={stat.value} decimalPlaces={stat.decimalPlaces || 0} className="inline" />
                    {stat.suffix}
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Key Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[
                {
                  title: "Unified Economy",
                  desc: "Single token (NOR) powers all applications, subscriptions, and transactions. No fragmentation, complete interoperability.",
                  Icon: Coins,
                  color: "from-yellow-500 to-orange-500",
                  metric: "1 Token"
                },
                {
                  title: "Zero Integration Friction",
                  desc: "All 8 applications share the same infrastructure, APIs, and user accounts. Build once, access everything.",
                  Icon: Layers,
                  color: "from-blue-500 to-cyan-500",
                  metric: "8 Apps"
                },
                {
                  title: "Enterprise Security",
                  desc: "Bank-grade security, SOC 2 certified infrastructure, and built-in compliance frameworks from day one.",
                  Icon: Lock,
                  color: "from-red-500 to-pink-500",
                  metric: "SOC 2"
                },
                {
                  title: "True SaaS Model",
                  desc: "Everything as a service with transparent pricing. Pay-as-you-go with NOR tokens, no hidden fees.",
                  Icon: TrendingUp,
                  color: "from-green-500 to-emerald-500",
                  metric: "SaaS"
                },
                {
                  title: "Developer Revenue Share",
                  desc: "Build applications on NorChain OS and earn from the ecosystem. 90/10 revenue split on marketplace.",
                  Icon: Code2,
                  color: "from-purple-500 to-violet-500",
                  metric: "90/10"
                },
                {
                  title: "Global Infrastructure",
                  desc: "Distributed nodes across multiple regions. 3-second finality with 99.9% uptime guarantee.",
                  Icon: Globe,
                  color: "from-cyan-500 to-blue-500",
                  metric: "99.9%"
                }
              ].map((benefit, index) => (
                <div key={index} className="group relative">
                  <div className="relative bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 h-full transition-all duration-300 hover:bg-gray-800/60 hover:border-gray-600/70 hover:transform hover:scale-105 hover:-translate-y-1 shadow-xl">

                    {/* Top metric badge */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="relative flex-shrink-0">
                        <div className={`absolute -inset-1 bg-gradient-to-br ${benefit.color} rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300`} />
                        <div className={`relative h-12 w-12 bg-gradient-to-br ${benefit.color} rounded-xl flex items-center justify-center shadow-lg`}>
                          <benefit.Icon className="w-6 h-6 text-white" strokeWidth={2} />
                        </div>
                      </div>
                      <div className={`px-3 py-1 bg-gradient-to-r ${benefit.color} rounded-lg text-white text-xs font-bold shadow-md`}>
                        {benefit.metric}
                      </div>
                    </div>

                    <h4 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300">
                      {benefit.title}
                    </h4>
                    <p className="text-base text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                      {benefit.desc}
                    </p>

                    {/* Bottom accent */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${benefit.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-2xl`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Value Proposition */}
            <div className="bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-indigo-900/30 border border-purple-500/20 rounded-2xl p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="h-12 w-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-purple-400" strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white mb-2">The Complete Package</h4>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    Traditional businesses need dozens of separate tools: payment processors, accounting software, messaging platforms,
                    trading infrastructure, compliance systems. <span className="text-white font-semibold">NorChain OS combines all of this
                    into one unified platform</span>, reducing complexity by 90% and costs by 80%.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="flex items-center gap-3 bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300">Single integration point</span>
                </div>
                <div className="flex items-center gap-3 bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300">One universal token (NOR)</span>
                </div>
                <div className="flex items-center gap-3 bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300">Built-in compliance & security</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-40 left-40 w-3 h-3 bg-purple-400 rounded-full animate-pulse opacity-60" />
        <div className="absolute top-60 right-32 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-50" style={{animationDelay: '1s'}} />
        <div className="absolute bottom-40 left-20 w-4 h-4 bg-indigo-400 rounded-lg rotate-45 animate-pulse opacity-40" style={{animationDelay: '2s'}} />
        <div className="absolute bottom-60 right-40 w-2 h-2 bg-violet-400 rounded-full animate-pulse opacity-60" style={{animationDelay: '3s'}} />
      </div>
    </section>
  );
}