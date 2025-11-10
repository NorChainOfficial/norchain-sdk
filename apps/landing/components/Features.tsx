"use client";

export default function Features() {
  const infrastructureFeatures = [
    {
      iconPath: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
      title: "Enterprise Security",
      description:
        "Multi-layer security architecture with HSM validators, formal verification, and regular third-party audits.",
      metric: "Bank-Grade",
      color: "from-red-400 to-pink-500",
    },
    {
      iconPath: "M13 10V3L4 14h7v7l9-11h-7z",
      title: "High Performance",
      description:
        "3-second block times, 10,000+ TPS capacity, and sub-100ms API response times for demanding applications.",
      metric: "Ultra Fast",
      color: "from-yellow-400 to-orange-500",
    },
    {
      iconPath: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9",
      title: "Global Accessibility",
      description:
        "99.9% uptime SLA, global CDN distribution, and 24/7 monitoring across multiple regions worldwide.",
      metric: "Always On",
      color: "from-cyan-400 to-blue-500",
    },
    {
      iconPath: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
      title: "Regulatory Ready",
      description:
        "Built-in compliance frameworks for GDPR, SOC 2, and regional regulations. Audit trails included.",
      metric: "Compliant",
      color: "from-blue-400 to-indigo-500",
    },
    {
      iconPath: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547A8.014 8.014 0 004 21h4.722a8.014 8.014 0 00.962-3.428L10 16.5l.316 1.072A8.014 8.014 0 0011.278 21H16a8.014 8.014 0 00-.244-5.572z",
      title: "Developer First",
      description:
        "Comprehensive APIs, SDKs, testing environments, and extensive documentation for rapid development.",
      metric: "Dev Ready",
      color: "from-purple-400 to-pink-500",
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
    <section id="features" className="py-20 bg-white scroll-mt-20">
      <div className="container mx-auto px-6">
        {/* Infrastructure Features Section */}
        <div className="mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900">
            Enterprise Infrastructure
          </h2>
          <p className="text-center text-gray-600 mb-16 text-lg max-w-3xl mx-auto">
            Production-ready blockchain infrastructure built for demanding enterprise applications
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {infrastructureFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className="group bg-white border-2 border-gray-200 rounded-2xl p-6 text-center transition-all duration-300 hover:border-blue-600 hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.iconPath}/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {feature.description}
                </p>
                <div
                  className={`bg-gradient-to-r ${feature.color} text-white font-bold px-3 py-2 rounded-lg text-sm inline-block shadow-md group-hover:shadow-lg transition-shadow`}
                >
                  {feature.metric}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* API Features Section */}
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900">
            Developer APIs & Tools
          </h2>
          <p className="text-center text-gray-600 mb-16 text-lg max-w-3xl mx-auto">
            Comprehensive API suite and developer tools designed for modern blockchain applications
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {apiFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className="group bg-white border-2 border-gray-200 rounded-2xl p-8 text-center transition-all duration-300 hover:border-blue-600 hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.iconPath}/>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-base leading-relaxed mb-4">
                  {feature.description}
                </p>
                <div
                  className={`bg-gradient-to-r ${feature.color} text-white font-bold px-4 py-2 rounded-lg inline-block shadow-md group-hover:shadow-lg transition-shadow`}
                >
                  {feature.metric}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <a
            href="#developer-tools"
            onClick={(e) => {
              e.preventDefault();
              document
                .querySelector("#developer-tools")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            Start Building
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
