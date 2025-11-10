"use client";

import { useState } from "react";

interface EnterpriseFeature {
  readonly title: string;
  readonly description: string;
  readonly benefits: readonly string[];
  readonly iconPath: string;
  readonly color: string;
  readonly category: string;
}

export default function EnterpriseFeatures(): JSX.Element {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  const enterpriseFeatures: readonly EnterpriseFeature[] = [
    {
      title: "Enterprise SLAs",
      description: "Guaranteed service levels with 99.9% uptime, priority support, and dedicated infrastructure resources for mission-critical applications.",
      benefits: ["99.9% uptime guarantee", "24/7 priority support", "Dedicated infrastructure", "Custom rate limits", "SLA monitoring dashboard"],
      iconPath: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
      color: "from-blue-500 to-blue-600",
      category: "Service Quality"
    },
    {
      title: "Security & Compliance",
      description: "Bank-grade security with SOC 2 Type II compliance, regular penetration testing, and comprehensive audit trails for regulatory requirements.",
      benefits: ["SOC 2 Type II certified", "Regular security audits", "Comprehensive logging", "GDPR compliance", "Data encryption at rest"],
      iconPath: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
      color: "from-red-500 to-red-600",
      category: "Security"
    },
    {
      title: "Advanced Analytics",
      description: "Deep blockchain analytics with custom dashboards, real-time monitoring, and business intelligence tools for data-driven decisions.",
      benefits: ["Custom dashboards", "Real-time monitoring", "Historical data analysis", "API usage analytics", "Performance insights"],
      iconPath: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      color: "from-purple-500 to-purple-600",
      category: "Analytics"
    },
    {
      title: "White-label Solutions",
      description: "Fully customizable blockchain infrastructure with your branding, custom endpoints, and dedicated resources for your specific use case.",
      benefits: ["Custom branding", "Dedicated endpoints", "Tailored infrastructure", "Private networks", "Custom integrations"],
      iconPath: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547A8.014 8.014 0 004 21h4.722a8.014 8.014 0 00.962-3.428L10 16.5l.316 1.072A8.014 8.014 0 0011.278 21H16a8.014 8.014 0 00-.244-5.572z",
      color: "from-indigo-500 to-indigo-600",
      category: "Customization"
    },
    {
      title: "Global Infrastructure",
      description: "Worldwide edge locations with intelligent routing, automatic failover, and regional data compliance for global applications.",
      benefits: ["Global edge locations", "Intelligent routing", "Automatic failover", "Regional compliance", "Low latency worldwide"],
      iconPath: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9",
      color: "from-green-500 to-green-600",
      category: "Infrastructure"
    },
    {
      title: "Developer Support",
      description: "Dedicated technical account management with custom integrations, architectural consulting, and priority issue resolution.",
      benefits: ["Dedicated account manager", "Architectural consulting", "Custom integrations", "Priority support queue", "Training sessions"],
      iconPath: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
      color: "from-amber-500 to-amber-600",
      category: "Support"
    }
  ] as const;

  return (
    <section id="enterprise" className="py-32 bg-gradient-to-b from-black via-gray-950 to-black scroll-mt-8 relative overflow-hidden">
      {/* Background elements inspired by Dribbble designs */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/10 via-purple-500/15 to-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-gradient-to-tl from-blue-500/10 via-indigo-500/15 to-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Bold Dribbble-inspired section header */}
        <div className="text-center mb-24">
          <div className="relative inline-block mb-8">
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white">
              Enterprise
            </h2>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 rounded-full" />
          </div>
          <p className="text-2xl text-gray-400 font-light max-w-4xl mx-auto leading-relaxed mb-8">
            Production-ready blockchain infrastructure designed for enterprises and institutions
          </p>
          <div className="inline-flex items-center gap-4 bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 px-8 py-5 rounded-3xl shadow-2xl">
            <div className="relative">
              <div className="h-4 w-4 bg-emerald-400 rounded-full animate-pulse" />
              <div className="absolute inset-0 h-4 w-4 bg-emerald-400 rounded-full animate-ping opacity-30" />
            </div>
            <span className="text-gray-200 font-medium text-xl">
              Trusted by 127+ Development Teams
            </span>
          </div>
        </div>

        {/* Dribbble-style enterprise features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-24">
          {enterpriseFeatures.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative"
              onClick={() => setActiveFeature(activeFeature === index ? null : index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setActiveFeature(activeFeature === index ? null : index);
                }
              }}
              role="button"
              tabIndex={0}
              aria-expanded={activeFeature === index}
              aria-label={`Learn more about ${feature.title}`}
            >
              {/* Modern glassmorphism card */}
              <div className={`relative bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 h-full transition-all duration-500 hover:bg-gray-900/60 hover:border-gray-600/70 hover:transform hover:scale-105 hover:-translate-y-2 shadow-2xl hover:shadow-3xl cursor-pointer ${
                activeFeature === index ? 'scale-105 -translate-y-2 bg-gray-900/60 border-gray-600/70' : ''
              }`}>
                
                {/* Dynamic gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl ${
                  activeFeature === index ? 'opacity-5' : ''
                }`} />
                
                {/* Enhanced category badge */}
                <div className="relative mb-6">
                  <div className="inline-flex items-center px-4 py-2 bg-gray-800/60 backdrop-blur-sm border border-gray-600/40 text-gray-300 text-sm font-medium rounded-2xl shadow-lg">
                    {feature.category}
                  </div>
                </div>

                {/* Icon with enhanced depth and glow */}
                <div className="relative mb-8">
                  <div className={`absolute -inset-2 bg-gradient-to-br ${feature.color} rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
                  <div className={`relative h-20 w-20 bg-gradient-to-br ${feature.color} rounded-3xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-500`}>
                    <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.iconPath}/>
                    </svg>
                  </div>
                </div>

                {/* Enhanced typography */}
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-gray-400 text-base font-normal leading-relaxed mb-6 group-hover:text-gray-300 transition-colors duration-300">
                  {feature.description}
                </p>

                {/* Benefits - Enhanced with glassmorphism */}
                <div className={`transition-all duration-500 ${
                  activeFeature === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                }`}>
                  <div className="border-t border-gray-600/50 pt-6">
                    <h4 className="font-semibold text-cyan-300 mb-4">Key Benefits:</h4>
                    <ul className="space-y-3">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-center gap-3 text-sm text-gray-300">
                          <div className="h-2 w-2 bg-emerald-400 rounded-full flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Modern expand/collapse indicator */}
                <div className="flex items-center justify-center mt-6">
                  <div className="h-8 w-8 bg-gray-800/60 backdrop-blur-sm border border-gray-600/40 rounded-2xl flex items-center justify-center">
                    <svg 
                      className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${
                        activeFeature === index ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                    </svg>
                  </div>
                </div>

                {/* Bottom accent line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-3xl ${
                  activeFeature === index ? 'scale-x-100' : ''
                }`} />
              </div>

              {/* Floating elements around card */}
              <div className={`absolute -top-2 -right-2 w-3 h-3 bg-gradient-to-r ${feature.color} rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-700 animate-pulse`} />
              <div className={`absolute -bottom-2 -left-2 w-2 h-2 bg-gradient-to-r ${feature.color} rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-700 animate-pulse`} />
            </div>
          ))}
        </div>

        {/* Modern CTA Section */}
        <div className="text-center">
          <div className="relative inline-block">
            <div className="absolute -inset-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 rounded-3xl blur-xl opacity-20" />
            <a
              href="https://enterprise.norchain.org/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="relative group inline-flex items-center gap-4 px-16 py-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 text-white rounded-3xl font-bold text-xl tracking-wide hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 hover:scale-105"
            >
              <span className="relative">Schedule Consultation</span>
              <svg className="w-6 h-6 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              
              {/* Button overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
            </a>
          </div>
        </div>

        {/* Enhanced floating elements */}
        <div className="absolute top-40 left-40 w-3 h-3 bg-indigo-400 rounded-full animate-pulse opacity-60" />
        <div className="absolute top-60 right-32 w-2 h-2 bg-purple-400 rounded-full animate-pulse opacity-50" style={{animationDelay: '1s'}} />
        <div className="absolute bottom-40 left-20 w-4 h-4 bg-violet-400 rounded-lg rotate-45 animate-pulse opacity-40" style={{animationDelay: '2s'}} />
        <div className="absolute bottom-60 right-40 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-60" style={{animationDelay: '3s'}} />
      </div>
    </section>
  );
}