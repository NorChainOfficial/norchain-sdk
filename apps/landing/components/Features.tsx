"use client";

import { useState, useRef } from "react";
import { Shield, Zap, Globe, Lock, Code2, BarChart3, Database, Clock, CreditCard, PieChart, MessageSquare, Bridge, Server, Activity, CheckCircle2, TrendingUp, Award, Users } from "lucide-react";
import { AnimatedBeam, Circle } from "./AnimatedBeam";
import { NumberTicker } from "./NumberTicker";

export default function Features() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  // Refs for animated beam
  const containerRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const securityRef = useRef<HTMLDivElement>(null);
  const performanceRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef<HTMLDivElement>(null);
  const complianceRef = useRef<HTMLDivElement>(null);

  const infrastructureFeatures = [
    {
      Icon: Shield,
      title: "Enterprise Security",
      description:
        "Multi-layer security architecture with HSM validators, formal verification, and regular third-party audits.",
      metric: "Bank-Grade",
      color: "from-cyan-400 to-blue-500",
      accent: "cyan",
    },
    {
      Icon: Zap,
      title: "High Performance",
      description:
        "3-second block times, 10,000+ TPS capacity, and sub-100ms API response times for demanding applications.",
      metric: "Ultra Fast",
      color: "from-blue-400 to-purple-500",
      accent: "blue",
    },
    {
      Icon: Globe,
      title: "Global Scale",
      description:
        "99.9% uptime SLA, global infrastructure, and enterprise-grade monitoring across multiple regions.",
      metric: "Always On",
      color: "from-purple-400 to-pink-500",
      accent: "purple",
    },
    {
      Icon: Lock,
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
      Icon: Code2,
      title: "Complete API Suite",
      description:
        "Full Ethereum-compatible JSON-RPC API with enhanced methods for enterprise blockchain applications.",
      metric: "100% Compatible",
      color: "from-blue-400 to-indigo-500",
    },
    {
      Icon: BarChart3,
      title: "Real-time Analytics",
      description:
        "WebSocket streams, historical data APIs, and business intelligence tools for comprehensive insights.",
      metric: "Live Data",
      color: "from-green-400 to-emerald-500",
    },
    {
      Icon: Database,
      title: "Scalable Infrastructure",
      description:
        "Auto-scaling endpoints, load balancing, and caching to handle enterprise-level traffic demands.",
      metric: "Auto Scale",
      color: "from-purple-400 to-pink-500",
    },
    {
      Icon: Clock,
      title: "Sub-100ms Response",
      description:
        "Optimized global infrastructure with edge caching ensures lightning-fast API responses worldwide.",
      metric: "<100ms",
      color: "from-yellow-400 to-orange-500",
    },
  ];

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-black via-gray-950 to-black scroll-mt-20 relative overflow-hidden">
      {/* Background elements inspired by Dribbble designs */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-gradient-to-br from-blue-500/10 via-violet-500/15 to-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-gradient-to-tl from-purple-500/10 via-blue-500/15 to-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Bold Dribbble-inspired section header */}
        <div className="text-center mb-16 sm:mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full mb-6">
            <Server className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-400">Enterprise-Grade Platform</span>
          </div>

          <div className="relative inline-block mb-6 sm:mb-8">
            <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white">
              Infrastructure
            </h2>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1.5 bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 rounded-full" />
          </div>
          <p className="text-lg sm:text-2xl text-gray-400 font-light max-w-4xl mx-auto leading-relaxed mb-8">
            Production-ready blockchain infrastructure trusted by enterprises worldwide
          </p>

          {/* Live Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { value: 3, suffix: "s", label: "Block Finality", Icon: Zap, color: "from-yellow-400 to-orange-500" },
              { value: 10000, suffix: "+", label: "TPS Capacity", Icon: Activity, color: "from-green-400 to-emerald-500", format: (n: number) => `${(n/1000).toFixed(0)}K` },
              { value: 99.9, suffix: "%", label: "Uptime SLA", Icon: CheckCircle2, color: "from-blue-400 to-cyan-500", decimalPlaces: 1 },
              { value: 100, prefix: "<", suffix: "ms", label: "API Response", Icon: TrendingUp, color: "from-purple-400 to-pink-500" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 hover:bg-gray-900/80 transition-all duration-300 hover:scale-105 group">
                <div className="flex justify-center mb-2">
                  <div className={`h-10 w-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                    <stat.Icon className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                </div>
                <div className={`text-3xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
                  {stat.prefix || ""}
                  {stat.format ? (
                    <NumberTicker value={stat.value} decimalPlaces={stat.decimalPlaces || 0} className="inline" />
                  ) : (
                    <NumberTicker value={stat.value} decimalPlaces={stat.decimalPlaces || 0} className="inline" />
                  )}
                  {stat.suffix || ""}
                </div>
                <div className="text-xs text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Infrastructure Connectivity Visualization with Animated Beams */}
        <div className="relative max-w-7xl mx-auto mb-24" ref={containerRef}>
          {/* Background glow effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/10 to-cyan-500/5 rounded-3xl blur-3xl" />

          <div className="relative flex items-center justify-center py-40 px-4" style={{ minHeight: '700px' }}>
            {/* Central Core Node */}
            <Circle
              ref={coreRef}
              className="border-4 border-blue-500 bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl shadow-blue-500/50 p-8"
            >
              <Server className="w-16 h-16 text-white" strokeWidth={2.5} />
            </Circle>

            {/* Security Node - Top Left */}
            <Circle
              ref={securityRef}
              className="absolute top-10 left-1/4 border-4 border-cyan-500 bg-gradient-to-br from-cyan-400 to-blue-500 p-6"
            >
              <Shield className="w-12 h-12 text-white" strokeWidth={2.5} />
            </Circle>

            {/* Performance Node - Top Right */}
            <Circle
              ref={performanceRef}
              className="absolute top-10 right-1/4 border-4 border-purple-500 bg-gradient-to-br from-blue-400 to-purple-500 p-6"
            >
              <Zap className="w-12 h-12 text-white" strokeWidth={2.5} />
            </Circle>

            {/* Scale Node - Bottom Left */}
            <Circle
              ref={scaleRef}
              className="absolute bottom-10 left-1/4 border-4 border-pink-500 bg-gradient-to-br from-purple-400 to-pink-500 p-6"
            >
              <Globe className="w-12 h-12 text-white" strokeWidth={2.5} />
            </Circle>

            {/* Compliance Node - Bottom Right */}
            <Circle
              ref={complianceRef}
              className="absolute bottom-10 right-1/4 border-4 border-green-500 bg-gradient-to-br from-green-400 to-cyan-500 p-6"
            >
              <Lock className="w-12 h-12 text-white" strokeWidth={2.5} />
            </Circle>

            {/* Animated Beams */}
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={coreRef}
              toRef={securityRef}
              gradientStartColor="#3b82f6"
              gradientStopColor="#06b6d4"
              duration={3}
              pathWidth={6}
              pathOpacity={0.3}
              curvature={50}
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={coreRef}
              toRef={performanceRef}
              gradientStartColor="#3b82f6"
              gradientStopColor="#a855f7"
              duration={3}
              delay={0.5}
              pathWidth={6}
              pathOpacity={0.3}
              curvature={50}
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={coreRef}
              toRef={scaleRef}
              gradientStartColor="#8b5cf6"
              gradientStopColor="#ec4899"
              duration={3}
              delay={1}
              pathWidth={6}
              pathOpacity={0.3}
              curvature={50}
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={coreRef}
              toRef={complianceRef}
              gradientStartColor="#10b981"
              gradientStopColor="#06b6d4"
              duration={3}
              delay={1.5}
              pathWidth={6}
              pathOpacity={0.3}
              curvature={50}
            />

            {/* Labels for each node - Enhanced visibility */}
            {/* Top Left - Security */}
            <div className="absolute top-0 left-[15%] transform -translate-x-1/2 -translate-y-full mb-4">
              <div className="bg-gray-900/90 backdrop-blur-xl border-2 border-cyan-500/50 rounded-2xl px-6 py-3 shadow-2xl">
                <p className="text-xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Enterprise Security</p>
                <p className="text-xs text-gray-400 mt-1">HSM Validators & Audits</p>
              </div>
            </div>

            {/* Top Right - Performance */}
            <div className="absolute top-0 right-[15%] transform translate-x-1/2 -translate-y-full mb-4">
              <div className="bg-gray-900/90 backdrop-blur-xl border-2 border-purple-500/50 rounded-2xl px-6 py-3 shadow-2xl">
                <p className="text-xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">High Performance</p>
                <p className="text-xs text-gray-400 mt-1">10K+ TPS • 3s Finality</p>
              </div>
            </div>

            {/* Bottom Left - Scale */}
            <div className="absolute bottom-0 left-[15%] transform -translate-x-1/2 translate-y-full mt-4">
              <div className="bg-gray-900/90 backdrop-blur-xl border-2 border-pink-500/50 rounded-2xl px-6 py-3 shadow-2xl">
                <p className="text-xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Global Scale</p>
                <p className="text-xs text-gray-400 mt-1">99.9% Uptime SLA</p>
              </div>
            </div>

            {/* Bottom Right - Compliance */}
            <div className="absolute bottom-0 right-[15%] transform translate-x-1/2 translate-y-full mt-4">
              <div className="bg-gray-900/90 backdrop-blur-xl border-2 border-green-500/50 rounded-2xl px-6 py-3 shadow-2xl">
                <p className="text-xl font-black bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">Compliance Ready</p>
                <p className="text-xs text-gray-400 mt-1">GDPR • SOC 2 • Audits</p>
              </div>
            </div>

            {/* Center - Core */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-24 text-center">
              <div className="bg-gray-900/90 backdrop-blur-xl border-4 border-blue-500/50 rounded-3xl px-8 py-4 shadow-2xl">
                <p className="text-3xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-1">NorChain Core</p>
                <p className="text-sm text-gray-300 font-semibold">Unified Infrastructure Platform</p>
              </div>
            </div>
          </div>
        </div>


        {/* Why Choose NorChain Infrastructure */}
        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 sm:p-12 shadow-2xl mb-16 sm:mb-24">
          <div className="text-center mb-12">
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Choose NorChain Infrastructure?
            </h3>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Battle-tested infrastructure powering mission-critical applications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Enterprise SLA",
                desc: "99.9% uptime guarantee with dedicated support and monitoring",
                Icon: Award,
                color: "from-blue-500 to-cyan-500",
                metricValue: 99.9,
                metricSuffix: "%",
                decimalPlaces: 1
              },
              {
                title: "Global CDN",
                desc: "Edge nodes in 15+ regions for low-latency worldwide access",
                Icon: Globe,
                color: "from-purple-500 to-pink-500",
                metricValue: 15,
                metricSuffix: "+ Regions"
              },
              {
                title: "Auto-Scaling",
                desc: "Dynamic resource allocation handling traffic spikes seamlessly",
                Icon: TrendingUp,
                color: "from-green-500 to-emerald-500",
                metric: "Auto"
              },
              {
                title: "SOC 2 Certified",
                desc: "Bank-grade security with regular third-party audits",
                Icon: Shield,
                color: "from-red-500 to-orange-500",
                metric: "SOC 2"
              },
              {
                title: "24/7 Monitoring",
                desc: "Real-time alerts and automated incident response",
                Icon: Activity,
                color: "from-yellow-500 to-amber-500",
                metric: "24/7"
              },
              {
                title: "Developer Support",
                desc: "Dedicated technical support team and comprehensive documentation",
                Icon: Users,
                color: "from-indigo-500 to-blue-500",
                metric: "24/7"
              }
            ].map((item, idx) => (
              <div key={idx} className="group relative">
                <div className="relative bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 h-full transition-all duration-300 hover:bg-gray-800/60 hover:border-gray-600/70 hover:transform hover:scale-105 hover:-translate-y-1 shadow-xl">

                  <div className="flex justify-between items-start mb-4">
                    <div className="relative flex-shrink-0">
                      <div className={`absolute -inset-1 bg-gradient-to-br ${item.color} rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300`} />
                      <div className={`relative h-12 w-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center shadow-lg`}>
                        <item.Icon className="w-6 h-6 text-white" strokeWidth={2} />
                      </div>
                    </div>
                    <div className={`px-3 py-1 bg-gradient-to-r ${item.color} rounded-lg text-white text-xs font-bold shadow-md`}>
                      {'metricValue' in item ? (
                        <>
                          <NumberTicker value={item.metricValue} decimalPlaces={item.decimalPlaces || 0} className="inline" />
                          {item.metricSuffix}
                        </>
                      ) : (
                        item.metric
                      )}
                    </div>
                  </div>

                  <h4 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors duration-300">
                    {item.title}
                  </h4>
                  <p className="text-base text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                    {item.desc}
                  </p>

                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-2xl`} />
                </div>
              </div>
            ))}
          </div>
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
