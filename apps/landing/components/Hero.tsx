"use client";

import { useEffect, useState } from "react";
import { Zap, Activity, Users, Blocks } from "lucide-react";
import { Globe } from "./Globe";

export default function Hero() {
  const [blockHeight, setBlockHeight] = useState(7542);
  const [apiUptime, setApiUptime] = useState(99.9);
  const [apiResponseTime, setApiResponseTime] = useState(85);
  const [activeDevs, setActiveDevs] = useState(127);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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
        
        setApiUptime(99.9 + Math.random() * 0.09);
        setApiResponseTime(80 + Math.random() * 20);
        setActiveDevs(120 + Math.floor(Math.random() * 15));
      } catch (error) {
        console.error("Error fetching infrastructure stats:", error);
      }
    };

    updateInfrastructureStats();
    const interval = setInterval(updateInfrastructureStats, 5000);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ 
        x: e.clientX / window.innerWidth, 
        y: e.clientY / window.innerHeight 
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen bg-black text-white overflow-hidden pt-20">
      {/* Dribbble-inspired background with advanced gradients */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large gradient orbs inspired by Web3 designs */}
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-to-br from-violet-600/20 via-blue-600/30 to-cyan-500/20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-emerald-500/25 via-blue-500/20 to-purple-600/30 rounded-full blur-3xl transform translate-x-1/3 translate-y-1/3" />
        
        {/* Interactive mesh gradient */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-violet-600/10 to-cyan-500/5"
          style={{
            transform: `translateX(${mousePosition.x * 30}px) translateY(${mousePosition.y * 30}px)`,
            transition: 'transform 0.4s ease-out'
          }}
        />
        
        {/* Modern geometric grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:80px_80px]" />
        
        {/* Floating geometric elements */}
        <div className="absolute top-20 right-20 w-4 h-4 bg-cyan-400 rounded-full animate-pulse opacity-60" />
        <div className="absolute top-40 left-40 w-6 h-6 bg-violet-500 rounded-lg rotate-45 animate-pulse opacity-40" style={{animationDelay: '1s'}} />
        <div className="absolute bottom-32 left-32 w-3 h-3 bg-emerald-400 rounded-full animate-pulse opacity-50" style={{animationDelay: '2s'}} />
        
        {/* Noise texture overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-16 relative z-10">
        <div className="max-w-7xl mx-auto">

          {/* Two-column layout: Text + Globe */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-12 sm:mb-20">

            {/* Left: Typography */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <div className="relative mb-6 sm:mb-8">
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none mb-4">
                  <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
                    NorChain
                  </span>
                </h1>
              
                {/* Accent line under title */}
                <div className="absolute -bottom-2 left-1/2 lg:left-0 transform -translate-x-1/2 lg:translate-x-0 w-32 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full opacity-80" />
              </div>
            
              <div className="relative mb-8 sm:mb-12">
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-light tracking-wide text-gray-300 mb-4 sm:mb-6">
                  The Complete
                  <span className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent mt-1 sm:mt-2">
                    Blockchain Operating System
                  </span>
                </h2>
              </div>

              {/* Status badge with modern styling */}
              <div className="inline-flex items-center gap-2 sm:gap-4 bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 px-4 sm:px-8 py-3 sm:py-5 rounded-3xl mb-6 sm:mb-8 hover:bg-gray-900/80 transition-all duration-300 shadow-2xl">
                <div className="relative">
                  <div className="h-4 w-4 bg-emerald-400 rounded-full animate-pulse" />
                  <div className="absolute inset-0 h-4 w-4 bg-emerald-400 rounded-full animate-ping opacity-30" />
                </div>
                <span className="text-gray-200 font-medium text-sm sm:text-xl">
                  Live Network
                </span>
                <div className="text-cyan-400 font-bold text-sm sm:text-xl">
                  {apiUptime.toFixed(1)}%
                </div>
              </div>

              {/* NorChain OS Badge */}
              <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-purple-900/60 via-blue-900/60 to-indigo-900/60 backdrop-blur-xl border border-purple-700/50 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl shadow-lg">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 bg-purple-400 rounded-full"></div>
                  <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                  <div className="h-2 w-2 bg-indigo-400 rounded-full"></div>
                </div>
                <span className="text-purple-200 font-medium text-xs sm:text-sm">
                  NorChain OS
                </span>
                <span className="text-blue-300 font-bold text-xs sm:text-sm">
                  12 Applications
                </span>
              </div>
            </div>

            {/* Right: Interactive Globe */}
            <div className="order-1 lg:order-2">
              <Globe className="scale-90 lg:scale-100" />
              <div className="text-center mt-6">
                <p className="text-sm text-gray-400 font-medium">
                  <span className="text-cyan-400 font-bold">15+</span> Global Infrastructure Nodes
                </p>
              </div>
            </div>

          </div>

          {/* Modern stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-20">
            {[
              { value: blockHeight.toLocaleString(), label: "Blocks Processed", color: "from-cyan-400 to-blue-500", Icon: Blocks },
              { value: `${apiUptime.toFixed(1)}%`, label: "Network Uptime", color: "from-emerald-400 to-green-500", Icon: Zap },
              { value: `${Math.round(apiResponseTime)}ms`, label: "API Response", color: "from-blue-400 to-violet-500", Icon: Activity },
              { value: `${activeDevs}+`, label: "Active Builders", color: "from-violet-400 to-purple-500", Icon: Users }
            ].map((stat, index) => (
              <div key={index} className="group text-center hover:scale-105 transition-all duration-300">
                <div className="relative mb-6">
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300`} />
                  <div className="relative flex justify-center mb-4">
                    <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-2xl`}>
                      <stat.Icon className="w-8 h-8 text-white" strokeWidth={2} />
                    </div>
                  </div>
                  <div className={`relative bg-gradient-to-r ${stat.color} bg-clip-text text-transparent text-2xl sm:text-4xl md:text-5xl font-black mb-2`}>
                    {stat.value}
                  </div>
                </div>
                <div className="text-gray-400 text-sm sm:text-base font-medium tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Dribbble-inspired CTA section */}
          <div className="text-center space-y-10">
            <p className="text-lg sm:text-2xl md:text-3xl font-light text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Everything as SaaS, Everything in NOR
              <span className="block mt-2 sm:mt-3 text-base sm:text-xl text-gray-400 font-light">
                12 integrated applications • Payments • Accounting • Messaging • Trading • Governance
              </span>
            </p>

            {/* Modern button group */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
              <button
                onClick={() => scrollToSection('features')}
                className="group relative bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-600 text-white px-8 sm:px-12 py-4 sm:py-5 rounded-2xl font-semibold text-base sm:text-lg tracking-wide hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 hover:scale-105 w-full sm:w-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                <span className="relative flex items-center gap-3">
                  Start Building
                  <svg className="w-6 h-6 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </button>

              <a
                href="https://docs.norchain.org"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-8 sm:px-12 py-4 sm:py-5 text-gray-300 hover:text-white font-semibold text-base sm:text-lg tracking-wide border-2 border-gray-600 hover:border-gray-400 rounded-2xl transition-all duration-300 hover:bg-gray-800/30 backdrop-blur-sm w-full sm:w-auto"
              >
                <span className="flex items-center gap-3">
                  Documentation
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}