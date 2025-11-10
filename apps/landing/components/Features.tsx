"use client";

import { useState } from "react";

export default function Features() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const infrastructureFeatures = [
    {
      iconPath: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
      title: "Enterprise Security",
      description:
        "Multi-layer security architecture with HSM validators, formal verification, and regular third-party audits.",
      metric: "Bank-Grade",
      color: "from-cyan-400 to-blue-500",
      accent: "cyan",
    },
    {
      iconPath: "M13 10V3L4 14h7v7l9-11h-7z",
      title: "High Performance",
      description:
        "3-second block times, 10,000+ TPS capacity, and sub-100ms API response times for demanding applications.",
      metric: "Ultra Fast",
      color: "from-blue-400 to-purple-500",
      accent: "blue",
    },
    {
      iconPath: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9",
      title: "Global Scale",
      description:
        "99.9% uptime SLA, global infrastructure, and enterprise-grade monitoring across multiple regions.",
      metric: "Always On",
      color: "from-purple-400 to-pink-500",
      accent: "purple",
    },
    {
      iconPath: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
      title: "Regulatory Ready",
      description:
        "Built-in compliance frameworks for GDPR, SOC 2, and regional regulations. Audit trails included.",
      metric: "Compliant",
      color: "from-green-400 to-cyan-500",
      accent: "green",
    },
  ];

  const apiFeatures = [
    {
      iconPath: "M10 20l4-16m18 4l4 4-4 4M6 16l-4-4 4-4",
      title: "Complete API Suite",
      description:
        "Full Ethereum-compatible JSON-RPC API with enhanced methods for enterprise blockchain applications.",
      metric: "100% Compatible",
      color: "from-blue-400 to-indigo-500",
    },
    {
      iconPath: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      title: "Real-time Analytics",
      description:
        "WebSocket streams, historical data APIs, and business intelligence tools for comprehensive insights.",
      metric: "Live Data",
      color: "from-green-400 to-emerald-500",
    },
    {
      iconPath: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4",
      title: "Scalable Infrastructure",
      description:
        "Auto-scaling endpoints, load balancing, and caching to handle enterprise-level traffic demands.",
      metric: "Auto Scale",
      color: "from-purple-400 to-pink-500",
    },
    {
      iconPath: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      title: "Sub-100ms Response",
      description:
        "Optimized global infrastructure with edge caching ensures lightning-fast API responses worldwide.",
      metric: "<100ms",
      color: "from-yellow-400 to-orange-500",
    },
  ];

  return (
    <section id="features" className="py-32 bg-gradient-to-b from-black via-gray-950 to-black scroll-mt-20 relative overflow-hidden">
      {/* Background elements inspired by Dribbble designs */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-gradient-to-br from-blue-500/10 via-violet-500/15 to-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-gradient-to-tl from-purple-500/10 via-blue-500/15 to-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Bold Dribbble-inspired section header */}
        <div className="text-center mb-16 sm:mb-24">
          <div className="relative inline-block mb-6 sm:mb-8">
            <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white">
              Infrastructure
            </h2>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1.5 bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 rounded-full" />
          </div>
          <p className="text-lg sm:text-2xl text-gray-400 font-light max-w-4xl mx-auto leading-relaxed">
            Enterprise-grade blockchain infrastructure engineered for the future
          </p>
        </div>

        {/* Dribbble-style feature grid with depth */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-16 sm:mb-24">
          {infrastructureFeatures.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative"
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              {/* Modern card with depth */}
              <div className="relative bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 h-full transition-all duration-500 hover:bg-gray-900/60 hover:border-gray-600/70 hover:transform hover:scale-105 hover:-translate-y-2 shadow-2xl hover:shadow-3xl">
                
                {/* Dynamic gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`} />
                
                {/* Icon with enhanced depth and glow */}
                <div className="relative mb-8">
                  <div className={`absolute -inset-2 bg-gradient-to-br ${feature.color} rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
                  <div className={`relative h-20 w-20 bg-gradient-to-br ${feature.color} rounded-3xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-500`}>
                    <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.iconPath}/>
                    </svg>
                  </div>
                  
                  {/* Floating indicator */}
                  <div className={`absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r ${feature.color} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse`} />
                </div>

                {/* Enhanced typography */}
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-gray-400 text-base font-normal leading-relaxed mb-8 group-hover:text-gray-300 transition-colors duration-300">
                  {feature.description}
                </p>

                {/* Modern badge with glow */}
                <div className={`inline-flex items-center text-sm font-bold text-white bg-gradient-to-r ${feature.color} px-4 py-2 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                  {feature.metric}
                </div>

                {/* Progressive reveal border */}
                <div className={`absolute inset-0 rounded-3xl border-2 border-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Bottom accent line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-3xl`} />
              </div>

              {/* Floating elements around card */}
              <div className={`absolute -top-2 -right-2 w-3 h-3 bg-gradient-to-r ${feature.color} rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-700 animate-pulse`} style={{animationDelay: `${index * 200}ms`}} />
              <div className={`absolute -bottom-2 -left-2 w-2 h-2 bg-gradient-to-r ${feature.color} rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-700 animate-pulse`} style={{animationDelay: `${index * 300}ms`}} />
            </div>
          ))}
        </div>

        {/* Bold CTA section */}
        <div className="text-center">
          <div className="relative inline-block">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-600 rounded-3xl blur-xl opacity-20" />
            <a
              href="#developer-tools"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector("#developer-tools")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="relative group inline-flex items-center gap-4 px-16 py-6 bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-600 text-white rounded-3xl font-bold text-xl tracking-wide hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 hover:scale-105"
            >
              <span className="relative">Explore Developer APIs</span>
              <svg className="w-6 h-6 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              
              {/* Button overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
            </a>
          </div>
        </div>

        {/* Enhanced floating elements */}
        <div className="absolute top-20 left-20 w-3 h-3 bg-cyan-400 rounded-full animate-pulse opacity-60" />
        <div className="absolute top-40 right-32 w-2 h-2 bg-violet-400 rounded-full animate-pulse opacity-50" style={{animationDelay: '1s'}} />
        <div className="absolute bottom-32 left-32 w-4 h-4 bg-blue-400 rounded-lg rotate-45 animate-pulse opacity-40" style={{animationDelay: '2s'}} />
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-emerald-400 rounded-full animate-pulse opacity-60" style={{animationDelay: '3s'}} />
      </div>
    </section>
  );
}
