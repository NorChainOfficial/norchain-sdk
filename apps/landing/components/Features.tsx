"use client";

export default function Features() {
  const corePhilosophy = [
    {
      icon: "🤲",
      title: "Ethical by Design",
      description:
        "No interest (riba), no gharar (excessive uncertainty), transparent risk-sharing. Built on Islamic finance principles.",
      metric: "Halal Finance",
      color: "from-emerald-400 to-green-500",
    },
    {
      icon: "✅",
      title: "Compliant by Default",
      description:
        "GDPR, AAOIFI, NSM and ISO 27001 mapped into smart-contract templates. Regulatory-ready from day one.",
      metric: "Multi-Standard",
      color: "from-blue-400 to-indigo-500",
    },
    {
      icon: "🧠",
      title: "Intelligent by Architecture",
      description:
        "AI-driven validators, liquidity management, and compliance agents. Predictive and autonomous.",
      metric: "AI-Powered",
      color: "from-purple-400 to-pink-500",
    },
    {
      icon: "🌍",
      title: "Inclusive by Access",
      description:
        "Publicly readable, permissionless use with verified-governance validators. Open to all.",
      metric: "Public Access",
      color: "from-cyan-400 to-blue-500",
    },
    {
      icon: "🌱",
      title: "Sustainable by Operation",
      description:
        "Low-energy PoSA consensus + carbon-offset program. Eco-friendly blockchain infrastructure.",
      metric: "Green Tech",
      color: "from-green-400 to-teal-500",
    },
  ];

  const technicalFeatures = [
    {
      icon: "⚡",
      title: "Lightning Fast",
      description:
        "3-second block finality with Parlia PoSA consensus. Near-instant transaction confirmation.",
      metric: "3s blocks",
      color: "from-yellow-400 to-orange-500",
    },
    {
      icon: "💰",
      title: "Ultra Affordable",
      description:
        "Gas fees under $0.001. 10,000x cheaper than Ethereum. Accessible to everyone globally.",
      metric: "<$0.001 fees",
      color: "from-green-400 to-emerald-500",
    },
    {
      icon: "🔧",
      title: "EVM Compatible",
      description:
        "Deploy Ethereum contracts with zero changes. Use MetaMask, Remix, Hardhat, Truffle.",
      metric: "Solidity ready",
      color: "from-blue-400 to-cyan-500",
    },
    {
      icon: "🔒",
      title: "Battle-Tested Security",
      description:
        "Multi-sig governance, HSM validator keys, quarterly audits. NSM compliance standards.",
      metric: "Enterprise Grade",
      color: "from-red-400 to-pink-500",
    },
  ];

  return (
    <section id="features" className="py-20 bg-white scroll-mt-20">
      <div className="container mx-auto px-6">
        {/* Core Philosophy Section */}
        <div className="mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900">
            Core Philosophy
          </h2>
          <p className="text-center text-gray-600 mb-16 text-lg max-w-3xl mx-auto">
            Five pillars that define NorChain's approach to blockchain finance
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {corePhilosophy.map((pillar, index) => (
              <div
                key={pillar.title}
                className="group bg-white border-2 border-gray-200 rounded-2xl p-6 text-center transition-all duration-300 hover:border-blue-600 hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {pillar.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {pillar.description}
                </p>
                <div
                  className={`bg-gradient-to-r ${pillar.color} text-white font-bold px-3 py-2 rounded-lg text-sm inline-block shadow-md group-hover:shadow-lg transition-shadow`}
                >
                  {pillar.metric}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Features Section */}
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900">
            Technical Excellence
          </h2>
          <p className="text-center text-gray-600 mb-16 text-lg max-w-3xl mx-auto">
            Enterprise-grade blockchain infrastructure built for performance and
            security
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {technicalFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className="group bg-white border-2 border-gray-200 rounded-2xl p-8 text-center transition-all duration-300 hover:border-blue-600 hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
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
            href="#charity"
            onClick={(e) => {
              e.preventDefault();
              document
                .querySelector("#charity")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-green-600 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            Explore Ecosystem
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
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
