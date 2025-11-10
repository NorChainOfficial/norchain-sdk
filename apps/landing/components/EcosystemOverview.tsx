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
    <section className="py-24 bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Developer Infrastructure
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            Build the next generation of decentralized applications with our
            comprehensive suite of developer tools, APIs, and infrastructure services.
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            From basic RPC calls to advanced analytics, we provide everything you need
            to create production-ready blockchain applications.
          </p>
        </div>

        {/* Developer Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {developerEcosystem.map((component) => (
            <div
              key={component.name}
              className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 ${
                activeComponent === component.name
                  ? "border-blue-500 scale-105"
                  : "border-transparent hover:border-blue-200"
              }`}
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
              {/* Icon */}
              <div
                className={`h-16 w-16 bg-gradient-to-br ${component.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
              >
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={component.iconPath}/>
                </svg>
              </div>

              {/* Component Name */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {component.name}
              </h3>

              {/* Category Badge */}
              <div className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded-full mb-4">
                {component.category}
              </div>
              
              {/* Description */}
              <p className="text-gray-600 leading-relaxed mb-4">
                {component.description}
              </p>
              
              {/* Action Link */}
              <a
                href={component.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Explore
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
              </a>
            </div>
          ))}
        </div>

        {/* Developer Quick Start */}
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Get Started in Minutes
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
              </div>
              <div className="text-lg font-bold text-blue-600 mb-2">
                Read Docs
              </div>
              <div className="text-sm text-gray-600">Comprehensive guides</div>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                </svg>
              </div>
              <div className="text-lg font-bold text-green-600 mb-2">
                Get API Key
              </div>
              <div className="text-sm text-gray-600">Free tier available</div>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className="h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m18 4l4 4-4 4M6 16l-4-4 4-4"/>
                </svg>
              </div>
              <div className="text-lg font-bold text-purple-600 mb-2">
                Write Code
              </div>
              <div className="text-sm text-gray-600">Use our SDKs</div>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
              <div className="h-12 w-12 bg-amber-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <div className="text-lg font-bold text-amber-600 mb-2">
                Deploy
              </div>
              <div className="text-sm text-gray-600">Go live instantly</div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <a
              href="https://docs.norchain.org/getting-started"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-2xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              Start Building Now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
