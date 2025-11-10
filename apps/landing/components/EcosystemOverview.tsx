"use client";

import { useState } from "react";

interface DeveloperEcosystemComponent {
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly link: string;
  readonly color: string;
  readonly iconPath: string;
}

export default function EcosystemOverview() {
  const [activeComponent, setActiveComponent] = useState<string | null>(null);

  const developerEcosystem: readonly DeveloperEcosystemComponent[] = [
    {
      name: "JSON-RPC API",
      description: "Complete Ethereum-compatible API with enhanced features for enterprise applications",
      category: "Core API",
      link: "https://api.norchain.org/api-docs",
      color: "from-blue-600 to-blue-700",
      iconPath: "M10 20l4-16m18 4l4 4-4 4M6 16l-4-4 4-4",
    },
    {
      name: "WebSocket Streams",
      description: "Real-time block, transaction, and event streaming for responsive applications",
      category: "Real-time",
      link: "https://docs.norchain.org/websockets",
      color: "from-green-600 to-green-700",
      iconPath: "M13 10V3L4 14h7v7l9-11h-7z",
    },
    {
      name: "Block Explorer API",
      description: "Comprehensive blockchain data access with advanced filtering and analytics",
      category: "Data Access",
      link: "https://explorer.norchain.org/api",
      color: "from-purple-600 to-purple-700",
      iconPath: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    },
    {
      name: "Smart Contract Tools",
      description: "Development tools, testing frameworks, and deployment utilities for smart contracts",
      category: "Development",
      link: "https://docs.norchain.org/smart-contracts",
      color: "from-amber-600 to-amber-700",
      iconPath: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    },
    {
      name: "Authentication SDKs",
      description: "Secure authentication and authorization libraries for multiple programming languages",
      category: "Security",
      link: "https://docs.norchain.org/auth",
      color: "from-red-600 to-red-700",
      iconPath: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    },
    {
      name: "Analytics Suite",
      description: "Business intelligence tools and APIs for blockchain analytics and insights",
      category: "Analytics",
      link: "https://analytics.norchain.org",
      color: "from-cyan-600 to-cyan-700",
      iconPath: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    },
    {
      name: "Monitoring Tools",
      description: "Infrastructure monitoring, alerting, and performance optimization tools",
      category: "DevOps",
      link: "https://monitor.norchain.org",
      color: "from-indigo-600 to-indigo-700",
      iconPath: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    },
    {
      name: "Test Networks",
      description: "Staging and development environments with faucets and testing utilities",
      category: "Testing",
      link: "https://testnet.norchain.org",
      color: "from-emerald-600 to-emerald-700",
      iconPath: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547A8.014 8.014 0 004 21h4.722a8.014 8.014 0 00.962-3.428L10 16.5l.316 1.072A8.014 8.014 0 0011.278 21H16a8.014 8.014 0 00-.244-5.572z",
    },
    {
      name: "Client Libraries",
      description: "Official SDKs and libraries for JavaScript, Python, Go, and other popular languages",
      category: "SDKs",
      link: "https://docs.norchain.org/sdks",
      color: "from-pink-600 to-pink-700",
      iconPath: "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
  ] as const;

  return (
    <section id="ecosystem" className="py-32 bg-gradient-to-b from-black via-gray-950 to-black scroll-mt-8 relative overflow-hidden">
      {/* Background elements inspired by Dribbble designs */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-[500px] h-[500px] bg-gradient-to-br from-purple-500/10 via-violet-500/15 to-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-[600px] h-[600px] bg-gradient-to-tl from-cyan-500/10 via-blue-500/15 to-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Bold Dribbble-inspired section header */}
        <div className="text-center mb-24">
          <div className="relative inline-block mb-8">
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white">
              Developer Tools
            </h2>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1.5 bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 rounded-full" />
          </div>
          <p className="text-2xl text-gray-400 font-light max-w-4xl mx-auto leading-relaxed mb-4">
            Comprehensive suite of developer tools, APIs, and infrastructure services
          </p>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed">
            Everything you need to create production-ready blockchain applications
          </p>
        </div>

        {/* Dribbble-style developer tools grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-24">
          {developerEcosystem.map((component) => (
            <div
              key={component.name}
              className="group relative"
              onClick={() =>
                setActiveComponent(
                  activeComponent === component.name ? null : component.name
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setActiveComponent(
                    activeComponent === component.name ? null : component.name
                  );
                }
              }}
              role="button"
              tabIndex={0}
              aria-expanded={activeComponent === component.name}
              aria-label={`Learn more about ${component.name}`}
            >
              {/* Modern glassmorphism card */}
              <div className="relative bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 h-full transition-all duration-500 hover:bg-gray-900/60 hover:border-gray-600/70 hover:transform hover:scale-105 hover:-translate-y-2 shadow-2xl hover:shadow-3xl cursor-pointer">
                
                {/* Dynamic gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${component.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`} />
                
                {/* Enhanced category badge */}
                <div className="relative mb-6">
                  <div className="inline-flex items-center px-4 py-2 bg-gray-800/60 backdrop-blur-sm border border-gray-600/40 text-gray-300 text-sm font-medium rounded-2xl shadow-lg">
                    {component.category}
                  </div>
                </div>

                {/* Icon with enhanced depth and glow */}
                <div className="relative mb-8">
                  <div className={`absolute -inset-2 bg-gradient-to-br ${component.color} rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
                  <div className={`relative h-20 w-20 bg-gradient-to-br ${component.color} rounded-3xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-500`}>
                    <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={component.iconPath}/>
                    </svg>
                  </div>
                </div>

                {/* Enhanced typography */}
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors duration-300">
                  {component.name}
                </h3>
                
                <p className="text-gray-400 text-base font-normal leading-relaxed mb-8 group-hover:text-gray-300 transition-colors duration-300">
                  {component.description}
                </p>

                {/* Modern action link */}
                <a
                  href={component.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 text-cyan-400 hover:text-cyan-300 font-semibold transition-colors duration-300 group-hover:translate-x-1 transform"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>Explore API</span>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                  </svg>
                </a>

                {/* Bottom accent line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${component.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-3xl`} />
              </div>

              {/* Floating elements around card */}
              <div className={`absolute -top-2 -right-2 w-3 h-3 bg-gradient-to-r ${component.color} rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-700 animate-pulse`} />
              <div className={`absolute -bottom-2 -left-2 w-2 h-2 bg-gradient-to-r ${component.color} rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-700 animate-pulse`} />
            </div>
          ))}
        </div>

        {/* Modern CTA Section */}
        <div className="text-center">
          <div className="relative inline-block">
            <div className="absolute -inset-6 bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-600 rounded-3xl blur-xl opacity-20" />
            <a
              href="https://docs.norchain.org/getting-started"
              target="_blank"
              rel="noopener noreferrer"
              className="relative group inline-flex items-center gap-4 px-16 py-6 bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-600 text-white rounded-3xl font-bold text-xl tracking-wide hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 hover:scale-105"
            >
              <span className="relative">Start Building</span>
              <svg className="w-6 h-6 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              
              {/* Button overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
            </a>
          </div>
        </div>

        {/* Enhanced floating elements */}
        <div className="absolute top-40 left-40 w-3 h-3 bg-cyan-400 rounded-full animate-pulse opacity-60" />
        <div className="absolute top-60 right-32 w-2 h-2 bg-violet-400 rounded-full animate-pulse opacity-50" style={{animationDelay: '1s'}} />
        <div className="absolute bottom-40 left-20 w-4 h-4 bg-blue-400 rounded-lg rotate-45 animate-pulse opacity-40" style={{animationDelay: '2s'}} />
        <div className="absolute bottom-60 right-40 w-2 h-2 bg-emerald-400 rounded-full animate-pulse opacity-60" style={{animationDelay: '3s'}} />
      </div>
    </section>
  );
}
