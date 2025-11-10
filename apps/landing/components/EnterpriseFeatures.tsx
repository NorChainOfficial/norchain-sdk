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
    <section className="py-24 bg-gradient-to-br from-gray-50 via-slate-50 to-blue-50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Enterprise Solutions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Production-ready blockchain infrastructure designed for enterprises, 
            institutions, and high-growth applications requiring maximum reliability.
          </p>
          <div className="inline-flex items-center gap-3 bg-blue-100 text-blue-700 px-6 py-3 rounded-full font-medium">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
            </svg>
            Trusted by 127+ Development Teams
          </div>
        </div>

        {/* Enterprise Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {enterpriseFeatures.map((feature, index) => (
            <div
              key={feature.title}
              className={`bg-white rounded-2xl p-8 shadow-lg border-2 transition-all duration-300 cursor-pointer ${
                activeFeature === index 
                  ? 'border-blue-500 scale-105 shadow-2xl' 
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-xl'
              }`}
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
              {/* Category Badge */}
              <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full mb-4">
                {feature.category}
              </div>

              {/* Icon */}
              <div className={`h-16 w-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.iconPath}/>
                </svg>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                {feature.description}
              </p>

              {/* Benefits - Show when active */}
              <div className={`transition-all duration-300 ${
                activeFeature === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
              }`}>
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Key Benefits:</h4>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center gap-3 text-sm text-gray-600">
                        <svg className="h-4 w-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                        </svg>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Expand/Collapse Indicator */}
              <div className="flex items-center justify-center mt-4">
                <svg 
                  className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${
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
          ))}
        </div>

        {/* Enterprise Metrics */}
        <div className="bg-white rounded-2xl p-8 shadow-xl mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Enterprise Performance Metrics
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">99.99%</div>
              <div className="text-sm text-gray-600">Enterprise Uptime</div>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">&lt;50ms</div>
              <div className="text-sm text-gray-600">Enterprise Response</div>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">24/7</div>
              <div className="text-sm text-gray-600">Priority Support</div>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9"/>
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">Global</div>
              <div className="text-sm text-gray-600">Edge Network</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-3xl font-bold mb-4">
              Ready for Enterprise-Grade Infrastructure?
            </h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join leading organizations building the future of decentralized applications 
              with our enterprise blockchain infrastructure.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6">
              <a
                href="https://enterprise.norchain.org/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-600 font-bold text-lg rounded-2xl hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                Schedule Consultation
              </a>
              
              <a
                href="https://docs.norchain.org/enterprise"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-blue-700 text-white font-bold text-lg rounded-2xl hover:bg-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-blue-500"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
                Enterprise Documentation
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}