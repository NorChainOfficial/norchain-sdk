"use client";

import { useState } from "react";
import { Search, RefreshCw, TrendingUp, Building, CreditCard, PieChart, MessageSquare, Network, Landmark, Shield, Code2, Server } from "lucide-react";

export default function ApplicationsEcosystem() {
  const [activeCategory, setActiveCategory] = useState<string>("core");

  const applicationCategories = {
    core: {
      name: "Core Infrastructure",
      description: "Essential blockchain services and explorer",
      apps: [
        {
          name: "Explorer",
          description: "Advanced blockchain explorer with real-time analytics and contract verification",
          Icon: Search,
          status: "Live",
          color: "from-blue-500 to-cyan-500",
          features: ["Real-time blocks", "Contract verification", "Advanced analytics", "GraphQL API"]
        },
        {
          name: "Swap",
          description: "Simple token swapping with optimal routing and minimal slippage",
          Icon: RefreshCw,
          status: "Live",
          color: "from-green-500 to-emerald-500",
          features: ["Optimal routing", "Low slippage", "Fast execution", "Multi-token support"]
        },
        {
          name: "DEX Pro",
          description: "Professional trading interface with limit orders and advanced charts",
          Icon: TrendingUp,
          status: "Live",
          color: "from-purple-500 to-violet-500",
          features: ["Limit orders", "Advanced charts", "Order book", "Portfolio tracking"]
        },
        {
          name: "NEX Exchange",
          description: "User-friendly exchange portal with fiat on/off-ramps",
          Icon: Building,
          status: "Live",
          color: "from-indigo-500 to-blue-500",
          features: ["Fiat integration", "Simple interface", "KYC support", "Mobile app"]
        }
      ]
    },
    business: {
      name: "Business Applications",
      description: "Enterprise SaaS applications for commerce and operations",
      apps: [
        {
          name: "NorPay",
          description: "Complete payment gateway with checkout, invoices, and subscriptions",
          Icon: CreditCard,
          status: "Coming Soon",
          color: "from-green-500 to-emerald-500",
          features: ["Hosted checkout", "Recurring billing", "Invoice system", "Merchant dashboard"]
        },
        {
          name: "NorLedger",
          description: "Blockchain-anchored accounting with daily audit trails",
          Icon: PieChart,
          status: "Coming Soon",
          color: "from-purple-500 to-violet-500",
          features: ["Double-entry books", "VAT/Tax support", "Blockchain anchoring", "Audit trails"]
        },
        {
          name: "NorChat",
          description: "E2EE messaging with payments and business profiles",
          Icon: MessageSquare,
          status: "Coming Soon",
          color: "from-pink-500 to-rose-500",
          features: ["End-to-end encryption", "In-chat payments", "Voice/video calls", "Business channels"]
        },
        {
          name: "Bridge",
          description: "Cross-chain asset transfers with proof verification",
          Icon: Network,
          status: "Coming Soon",
          color: "from-orange-500 to-amber-500",
          features: ["Multi-chain support", "Proof verification", "Low fees", "Fast finality"]
        }
      ]
    },
    governance: {
      name: "Governance & Compliance",
      description: "DAO tools and regulatory compliance systems",
      apps: [
        {
          name: "Governance",
          description: "DAO voting, proposals, and treasury management",
          Icon: Landmark,
          status: "Coming Soon",
          color: "from-indigo-500 to-blue-500",
          features: ["Proposal system", "Token voting", "Treasury control", "Execution tracking"]
        },
        {
          name: "Compliance Hub",
          description: "KYC/AML screening and regulatory reporting",
          Icon: Shield,
          status: "Coming Soon",
          color: "from-red-500 to-pink-500",
          features: ["Address screening", "Travel rule", "Case management", "Audit reports"]
        },
        {
          name: "Developer Portal",
          description: "API docs, SDKs, and developer tools",
          Icon: Code2,
          status: "Beta",
          color: "from-teal-500 to-cyan-500",
          features: ["API playground", "SDK downloads", "Usage analytics", "Documentation"]
        },
        {
          name: "Validator Ops",
          description: "Network monitoring and validator management",
          Icon: Server,
          status: "Coming Soon",
          color: "from-gray-500 to-slate-500",
          features: ["Network health", "Validator metrics", "Alerting", "Performance tracking"]
        }
      ]
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Live": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Beta": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Coming Soon": return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <section id="applications" className="py-20 bg-gradient-to-b from-black via-gray-950 to-black scroll-mt-20 relative overflow-hidden">
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
              Applications
            </h2>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1.5 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-full" />
          </div>
          <p className="text-lg sm:text-2xl text-gray-400 font-light max-w-4xl mx-auto leading-relaxed mb-8">
            Complete ecosystem of integrated applications
          </p>
          
          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-4">
            {Object.entries(applicationCategories).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeCategory === key
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-800/60 text-gray-300 hover:bg-gray-700/60 hover:text-white"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Active Category Display */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              {applicationCategories[activeCategory as keyof typeof applicationCategories].name}
            </h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              {applicationCategories[activeCategory as keyof typeof applicationCategories].description}
            </p>
          </div>

          {/* Applications Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {applicationCategories[activeCategory as keyof typeof applicationCategories].apps.map((app, index) => (
              <div
                key={app.name}
                className="group relative animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* App Card */}
                <div className="relative bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 h-full transition-all duration-500 hover:bg-gray-900/60 hover:border-gray-600/70 hover:transform hover:scale-105 hover:-translate-y-2 shadow-2xl hover:shadow-3xl cursor-pointer">

                  {/* Dynamic gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${app.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`} />

                  {/* Icon and Title in one line with Status Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="relative flex-shrink-0">
                        <div className={`absolute -inset-1 bg-gradient-to-br ${app.color} rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
                        <div className={`relative h-14 w-14 bg-gradient-to-br ${app.color} rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-all duration-500`}>
                          <app.Icon className="h-7 w-7 text-white" strokeWidth={2} />
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors duration-300">
                        {app.name}
                      </h3>
                    </div>

                    {/* Status Badge */}
                    <div className={`px-3 py-1.5 border rounded-lg text-xs font-medium flex-shrink-0 ${getStatusBadgeColor(app.status)}`}>
                      {app.status}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <p className="text-gray-400 text-base leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                      {app.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-2">
                      <div className="text-sm text-gray-500 font-medium">Key Features:</div>
                      <div className="grid grid-cols-2 gap-2">
                        {app.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                            <div className="h-1.5 w-1.5 bg-cyan-400 rounded-full flex-shrink-0"></div>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom accent line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${app.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-3xl`} />
                </div>

                {/* Floating indicators */}
                <div className={`absolute -top-2 -right-2 w-3 h-3 bg-gradient-to-r ${app.color} rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-700 animate-pulse`} style={{animationDelay: `${index * 200}ms`}} />
                <div className={`absolute -bottom-2 -left-2 w-2 h-2 bg-gradient-to-r ${app.color} rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-700 animate-pulse`} style={{animationDelay: `${index * 300}ms`}} />
              </div>
            ))}
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