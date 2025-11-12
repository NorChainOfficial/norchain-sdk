"use client";

export default function Roadmap() {
  const milestones = [
    {
      quarter: "Q4 2024",
      title: "Foundation",
      status: "completed",
      items: [
        "✅ Mainnet launch",
        "✅ Block explorer",
        "✅ Bridge to Ethereum",
        "✅ NorSwap DEX",
      ],
    },
    {
      quarter: "Q1 2025",
      title: "Growth",
      status: "completed",
      items: [
        "✅ Staking platform",
        "✅ Governance DAO",
        "✅ Mobile wallet app",
        "✅ First charity donations",
      ],
    },
    {
      quarter: "Q2 2025",
      title: "Expansion",
      status: "in-progress",
      items: [
        "🔄 Cross-chain bridges (BSC, Polygon)",
        "🔄 NFT marketplace",
        "⏳ Lending protocol",
        "⏳ Developer grants program",
      ],
    },
    {
      quarter: "Q3 2025",
      title: "Scale",
      status: "planned",
      items: [
        "📋 Layer 2 scaling solution",
        "📋 Enterprise partnerships",
        "📋 Decentralized identity",
        "📋 Carbon credit marketplace",
      ],
    },
    {
      quarter: "Q4 2025",
      title: "Maturity",
      status: "planned",
      items: [
        "📋 1M+ transactions/day",
        "📋 100+ dApps in ecosystem",
        "📋 $1M+ donated to charity",
        "📋 Full decentralization",
      ],
    },
  ];

  return (
    <section id="roadmap" className="py-20 bg-white scroll-mt-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Roadmap
          </h2>
          <p className="text-xl text-gray-600">
            Our journey to becoming the world&apos;s most impactful blockchain
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-600 via-green-500 to-gray-300"></div>

            {/* Milestones */}
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div
                  key={milestone.quarter}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Timeline dot */}
                  <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full border-4 border-white shadow-lg bg-gradient-to-r from-blue-600 to-green-500 z-10"></div>

                  {/* Content */}
                  <div
                    className={`w-full md:w-5/12 ${index % 2 === 0 ? "md:pr-12" : "md:pl-12"}`}
                  >
                    <div
                      className={`bg-white rounded-xl p-6 shadow-lg border-2 ${
                        milestone.status === "completed"
                          ? "border-green-500"
                          : milestone.status === "in-progress"
                            ? "border-blue-500"
                            : "border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-sm text-gray-600 font-semibold">
                            {milestone.quarter}
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {milestone.title}
                          </h3>
                        </div>
                        <div>
                          {milestone.status === "completed" && (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                              DONE
                            </span>
                          )}
                          {milestone.status === "in-progress" && (
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                              NOW
                            </span>
                          )}
                          {milestone.status === "planned" && (
                            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">
                              SOON
                            </span>
                          )}
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {milestone.items.map((item, i) => (
                          <li key={i} className="text-gray-700">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Spacer for opposite side */}
                  <div className="hidden md:block w-5/12"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-6">
            Want to contribute to our roadmap?
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://github.com/norchain/norchain-sdk/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:scale-105"
            >
              Join Governance Forum
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
            <a
              href="#faq"
              onClick={(e) => {
                e.preventDefault();
                document
                  .querySelector("#faq")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gray-100 text-gray-900 rounded-lg font-semibold hover:bg-gray-200 transition-all shadow-lg hover:scale-105"
            >
              Have Questions?
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
      </div>
    </section>
  );
}
