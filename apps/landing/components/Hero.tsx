"use client";

import { useEffect, useState } from "react";

// Add ethereum type to Window
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      isMetaMask?: boolean;
    };
  }
}

export default function Hero() {
  const [blockHeight, setBlockHeight] = useState(7542);
  const [apiUptime, setApiUptime] = useState(99.9);
  const [apiResponseTime, setApiResponseTime] = useState(85);
  const [activeDevs, setActiveDevs] = useState(127);

  useEffect(() => {
    const updateInfrastructureStats = async () => {
      try {
        const response = await fetch("https://rpc.norchain.org", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_blockNumber",
            params: [],
            id: 1,
          }),
        });
        const data = await response.json();
        const height = parseInt(data.result, 16);
        setBlockHeight(height);
        
        // Simulate infrastructure metrics (in production, fetch from monitoring API)
        setApiUptime(99.9 + Math.random() * 0.09);
        setApiResponseTime(80 + Math.random() * 20);
        setActiveDevs(120 + Math.floor(Math.random() * 15));
      } catch (error) {
        console.error("Error fetching infrastructure stats:", error);
      }
    };

    updateInfrastructureStats();
    const interval = setInterval(updateInfrastructureStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="text-center">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="h-24 w-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl hover:scale-105 transition-transform">
              <span className="text-white font-bold text-5xl">N</span>
            </div>
          </div>

          {/* Main Tagline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
            NorChain
            <br />
            <span className="text-blue-300">Infrastructure</span>
          </h1>

          {/* Enterprise Badge */}
          <div className="inline-flex items-center gap-3 bg-blue-500/20 backdrop-blur-md border-2 border-blue-400 px-6 py-3 rounded-full mb-6">
            <span className="text-3xl">🏗️</span>
            <span className="text-lg font-bold text-blue-100">
              Enterprise-Grade Blockchain Infrastructure
            </span>
          </div>

          {/* Key Infrastructure Features */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-lg">
              <span className="text-blue-300 font-bold">✓ 99.9% API Uptime</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-lg">
              <span className="text-blue-300 font-bold">✓ &lt;100ms Response Time</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-lg">
              <span className="text-blue-300 font-bold">✓ Enterprise SLAs</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-lg">
              <span className="text-blue-300 font-bold">✓ Regulatory Compliant</span>
            </div>
          </div>

          {/* Mission */}
          <div className="mb-6 bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-4xl mx-auto border border-white/20">
            <h2 className="text-sm uppercase tracking-wide text-blue-200 mb-2">
              Our Mission
            </h2>
            <p className="text-xl md:text-2xl text-white font-medium">
              Power the next generation of decentralized applications with 
              enterprise-grade blockchain infrastructure. Secure, scalable, 
              and compliant infrastructure for developers and institutions.
            </p>
          </div>

          {/* Vision */}
          <p className="text-lg md:text-xl mb-8 text-blue-100 max-w-4xl mx-auto leading-relaxed">
            Building the foundation for institutional blockchain adoption with 
            professional-grade APIs, comprehensive tools, and enterprise support.
          </p>

          {/* Live Infrastructure Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-10">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold">
                {blockHeight.toLocaleString()}+
              </div>
              <div className="text-blue-200 text-sm md:text-base">Blocks</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-green-300">
                {apiUptime.toFixed(1)}%
              </div>
              <div className="text-blue-200 text-sm md:text-base">
                API Uptime
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold">
                {Math.round(apiResponseTime)}ms
              </div>
              <div className="text-blue-200 text-sm md:text-base">Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-purple-300">
                {activeDevs}+
              </div>
              <div className="text-blue-200 text-sm md:text-base">
                Active Developers
              </div>
            </div>
          </div>

          {/* Primary CTA: Developer Documentation */}
          <button
            onClick={() => scrollToSection('developer-tools')}
            className="bg-white text-blue-700 px-10 py-4 rounded-lg text-xl font-bold hover:bg-blue-50 transition-all shadow-2xl hover:scale-105 inline-flex items-center gap-3 mb-6"
          >
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m18 4l4 4-4 4M6 16l-4-4 4-4"/>
            </svg>
            Start Building
          </button>

          {/* Secondary CTAs */}
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://docs.norchain.org"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-800/50 backdrop-blur-sm text-white rounded-lg hover:bg-blue-700/50 transition-all border border-blue-400/30 hover:scale-105 inline-flex items-center gap-2"
            >
              Documentation
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
            </a>
            <a
              href="https://api.norchain.org/api-docs"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-800/50 backdrop-blur-sm text-white rounded-lg hover:bg-blue-700/50 transition-all border border-blue-400/30 hover:scale-105 inline-flex items-center gap-2"
            >
              API Reference
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
            </a>
            <a
              href="https://explorer.norchain.org"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-800/50 backdrop-blur-sm text-white rounded-lg hover:bg-blue-700/50 transition-all border border-blue-400/30 hover:scale-105 inline-flex items-center gap-2"
            >
              Explorer
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
            </a>
            <a
              href="https://github.com/norchain"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-800/50 backdrop-blur-sm text-white rounded-lg hover:bg-blue-700/50 transition-all border border-blue-400/30 hover:scale-105 inline-flex items-center gap-2"
            >
              GitHub
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  );
}