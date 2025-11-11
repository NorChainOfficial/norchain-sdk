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
          color: "from-amber-600 to-orange-700",
          features: ["Real-time blocks", "Contract verification", "Advanced analytics", "GraphQL API"]
        },
        {
          name: "Swap",
          description: "Simple token swapping with optimal routing and minimal slippage",
          Icon: RefreshCw,
          status: "Live",
          color: "from-amber-600 to-orange-700",
          features: ["Optimal routing", "Low slippage", "Fast execution", "Multi-token support"]
        },
        {
          name: "DEX Pro",
          description: "Professional trading interface with limit orders and advanced charts",
          Icon: TrendingUp,
          status: "Live",
          color: "from-amber-600 to-orange-700",
          features: ["Limit orders", "Advanced charts", "Order book", "Portfolio tracking"]
        },
        {
          name: "NEX Exchange",
          description: "User-friendly exchange portal with fiat on/off-ramps",
          Icon: Building,
          status: "Live",
          color: "from-amber-600 to-orange-700",
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
          color: "from-amber-600 to-orange-700",
          features: ["Hosted checkout", "Recurring billing", "Invoice system", "Merchant dashboard"]
        },
        {
          name: "NorLedger",
          description: "Blockchain-anchored accounting with daily audit trails",
          Icon: PieChart,
          status: "Coming Soon",
          color: "from-amber-600 to-orange-700",
          features: ["Double-entry books", "VAT/Tax support", "Blockchain anchoring", "Audit trails"]
        },
        {
          name: "NorChat",
          description: "E2EE messaging with payments and business profiles",
          Icon: MessageSquare,
          status: "Coming Soon",
          color: "from-amber-600 to-orange-700",
          features: ["End-to-end encryption", "In-chat payments", "Voice/video calls", "Business channels"]
        },
        {
          name: "Bridge",
          description: "Cross-chain asset transfers with proof verification",
          Icon: Network,
          status: "Coming Soon",
          color: "from-amber-600 to-orange-700",
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
          color: "from-amber-600 to-orange-700",
          features: ["Proposal system", "Token voting", "Treasury control", "Execution tracking"]
        },
        {
          name: "Compliance Hub",
          description: "KYC/AML screening and regulatory reporting",
          Icon: Shield,
          status: "Coming Soon",
          color: "from-amber-600 to-orange-700",
          features: ["Address screening", "Travel rule", "Case management", "Audit reports"]
        },
        {
          name: "Developer Portal",
          description: "API docs, SDKs, and developer tools",
          Icon: Code2,
          status: "Beta",
          color: "from-amber-600 to-orange-700",
          features: ["API playground", "SDK downloads", "Usage analytics", "Documentation"]
        },
        {
          name: "Validator Ops",
          description: "Network monitoring and validator management",
          Icon: Server,
          status: "Coming Soon",
          color: "from-amber-600 to-orange-700",
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
        <div className="absolute top-20 left-20 w-[600px] h-[600px] bg-gradient-to-br from-amber-600/10 via-orange-600/15 to-yellow-700/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-gradient-to-tl from-orange-600/10 via-amber-600/15 to-yellow-600/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(217,119,6,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(217,119,6,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-24">
          <div className="relative inline-block mb-8">
            <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white">
              Applications
            </h2>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1.5 bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-700 rounded-full" />
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
                    ? "bg-amber-600 text-white shadow-lg"
                    : "bg-gray-800/60 text-gray-300 hover:bg-gray-700/60 hover:text-white"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Applications Grid */}
        <div className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {applicationCategories[activeCategory as keyof typeof applicationCategories].apps.map((app, index) => (
              <div
                key={app.name}
                className="group relative animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* App Card */}
                <div className="relative bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-10 h-full transition-all duration-500 hover:bg-gray-900/60 hover:border-amber-500/50 hover:transform hover:scale-105 hover:-translate-y-2 shadow-2xl hover:shadow-3xl cursor-pointer">

                  {/* Dynamic gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${app.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`} />

                  {/* Top Section: Icon, Title, Status Badge */}
                  <div className="relative flex items-start justify-between mb-8">
                    <div className="flex items-center gap-5 flex-1">
                      <div className="relative flex-shrink-0">
                        <div className={`absolute -inset-2 bg-gradient-to-br ${app.color} rounded-2xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500`} />
                        <div className={`relative h-16 w-16 bg-gradient-to-br ${app.color} rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-500`}>
                          <app.Icon className="h-8 w-8 text-white" strokeWidth={2.5} />
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-2xl font-black text-white group-hover:text-amber-300 transition-colors duration-300 mb-1">
                          {app.name}
                        </h3>
                        <div className={`px-3 py-1 border rounded-lg text-xs font-semibold inline-block ${getStatusBadgeColor(app.status)}`}>
                          {app.status}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="relative text-gray-400 text-base leading-relaxed mb-6 group-hover:text-gray-300 transition-colors duration-300">
                    {app.description}
                  </p>

                  {/* Features Grid */}
                  <div className="relative grid grid-cols-2 gap-3">
                    {app.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                        <div className={`h-2 w-2 bg-gradient-to-br ${app.color} rounded-full flex-shrink-0 shadow-lg`}></div>
                        <span className="font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Bottom accent line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${app.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-3xl shadow-lg`} />
                </div>

                {/* Floating indicators */}
                <div className={`absolute -top-2 -right-2 w-3 h-3 bg-gradient-to-r ${app.color} rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-700 animate-pulse`} style={{animationDelay: `${index * 200}ms`}} />
                <div className={`absolute -bottom-2 -left-2 w-2 h-2 bg-gradient-to-r ${app.color} rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-700 animate-pulse`} style={{animationDelay: `${index * 300}ms`}} />
              </div>
            ))}
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-40 left-40 w-3 h-3 bg-amber-500 rounded-full animate-pulse opacity-60" />
        <div className="absolute top-60 right-32 w-2 h-2 bg-orange-500 rounded-full animate-pulse opacity-50" style={{animationDelay: '1s'}} />
        <div className="absolute bottom-40 left-20 w-4 h-4 bg-yellow-600 rounded-lg rotate-45 animate-pulse opacity-40" style={{animationDelay: '2s'}} />
        <div className="absolute bottom-60 right-40 w-2 h-2 bg-amber-600 rounded-full animate-pulse opacity-60" style={{animationDelay: '3s'}} />
      </div>
    </section>
  );
}