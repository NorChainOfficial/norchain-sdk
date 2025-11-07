"use client";

interface FundProduct {
  readonly name: string;
  readonly model: string;
  readonly targetPartner: string;
  readonly description: string;
  readonly icon: string;
  readonly color: string;
}

export default function FinancialProducts() {
  const fundProducts: readonly FundProduct[] = [
    {
      name: "Gold Savings Fund",
      model: "Murābaḥah / Wakālah",
      targetPartner: "Gold traders & vaults",
      description:
        "Invest in physical gold with Shariah-compliant profit-sharing mechanisms",
      icon: "🥇",
      color: "from-yellow-600 to-amber-600",
    },
    {
      name: "Dirhamat Reserve Fund",
      model: "Commodity Murābaḥah",
      targetPartner: "UAE banks",
      description:
        "AED/Gold-backed stablecoin fund with 16.5x overcollateralization",
      icon: "🏦",
      color: "from-emerald-600 to-green-600",
    },
    {
      name: "Digital KES Income Fund",
      model: "Muḍārabah",
      targetPartner: "Kenyan banks & microfinance",
      description:
        "Kenyan Shilling tokenized fund supporting East African economies",
      icon: "🌍",
      color: "from-green-600 to-teal-600",
    },
    {
      name: "Real Estate Ijārah Fund",
      model: "Ijārah",
      targetPartner: "Developers & leasing firms",
      description:
        "Tokenized real estate with monthly rental payouts and fractional ownership",
      icon: "🏢",
      color: "from-blue-600 to-indigo-600",
    },
    {
      name: "Sukuk Portfolio Fund",
      model: "Muḍārabah",
      targetPartner: "Investment banks",
      description:
        "Islamic bonds portfolio with diversified Shariah-compliant yields",
      icon: "📈",
      color: "from-purple-600 to-pink-600",
    },
    {
      name: "SME Growth Fund",
      model: "Mushārakah",
      targetPartner: "Chambers of commerce",
      description:
        "Asset-based financing for small and medium enterprises with profit-sharing",
      icon: "🚀",
      color: "from-orange-600 to-red-600",
    },
    {
      name: "Waqf Impact Fund",
      model: "Waqf / Tabarru'",
      targetPartner: "Endowment authorities",
      description:
        "Perpetual charitable assets on-chain with transparent impact tracking",
      icon: "🤲",
      color: "from-teal-600 to-cyan-600",
    },
    {
      name: "Takaful Reserve Pool",
      model: "Tabarru'",
      targetPartner: "Insurance operators",
      description:
        "Islamic insurance cooperative with shared risk and transparent claims",
      icon: "🛡️",
      color: "from-indigo-600 to-purple-600",
    },
  ] as const;

  const industries = [
    {
      industry: "Banks",
      challenge: "Legacy core systems, lack of blockchain integration",
      solution: "Plug-and-play tokenization via Noor API",
      icon: "🏦",
    },
    {
      industry: "Real Estate",
      challenge: "Liquidity lock-in & fractional ownership barriers",
      solution: "On-chain Ijārah tokens + DEX liquidity",
      icon: "🏢",
    },
    {
      industry: "Fintechs",
      challenge: "Compliance burden & slow licensing",
      solution: "Built-in AAOIFI & GDPR modules",
      icon: "💳",
    },
    {
      industry: "Charities",
      challenge: "Opaque fund flows & trust deficit",
      solution: "Transparent zakat & waqf tracking",
      icon: "🤲",
    },
  ] as const;

  return (
    <section className="py-24 bg-white" id="financial-products">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Noor Funds: Halal Finance for a Digital World
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            Built for <strong>profit-sharing, not interest</strong>. Each fund
            is anchored to real assets and verified by the Shariah Oracle.
          </p>
          <div className="inline-block bg-gradient-to-r from-blue-100 to-green-100 px-8 py-4 rounded-xl mt-6">
            <p className="text-2xl font-bold text-gray-900">
              "Finance should build communities—not debt."
            </p>
          </div>
        </div>

        {/* Fund Products Grid */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-gray-900 mb-10 text-center">
            Core Fund Structures
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {fundProducts.map((fund) => (
              <div
                key={fund.name}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-200"
              >
                {/* Icon */}
                <div
                  className={`h-14 w-14 bg-gradient-to-br ${fund.color} rounded-xl flex items-center justify-center text-3xl mb-4 shadow-md`}
                >
                  {fund.icon}
                </div>

                {/* Fund Name */}
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {fund.name}
                </h4>

                {/* Model */}
                <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-medium mb-3">
                  {fund.model}
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-3">
                  {fund.description}
                </p>

                {/* Target Partner */}
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 font-medium">
                    Partner: {fund.targetPartner}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Highlights */}
        <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 shadow-lg mb-20">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Technology Highlights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">📜</div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                FundUnit Token Standard
              </h4>
              <p className="text-gray-600 text-sm">
                Tokenized ownership with NAV oracle binding for real-time
                valuations
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🤖</div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                AI NAV Agent
              </h4>
              <p className="text-gray-600 text-sm">
                Reconciles valuations in real time with predictive analytics
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🛡️</div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                Compliance Layer
              </h4>
              <p className="text-gray-600 text-sm">
                Auto-checks investor jurisdiction and AAOIFI compliance
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">💚</div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                Zakat Engine
              </h4>
              <p className="text-gray-600 text-sm">
                Computes 2.5% yearly purification and directs charity
                automatically
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🌉</div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                Bridge to RWA
              </h4>
              <p className="text-gray-600 text-sm">
                Integrates with Dirhamat (AED/gold) and Digital KES
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">📊</div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                Transparent Reporting
              </h4>
              <p className="text-gray-600 text-sm">
                Daily NAV + fatwa hashes published on-chain for auditors
              </p>
            </div>
          </div>
        </div>

        {/* Industry Solutions */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-gray-900 mb-10 text-center">
            Value for Industries
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {industries.map((item) => (
              <div
                key={item.industry}
                className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100 hover:border-green-200 transition-all"
              >
                <div className="flex items-start space-x-4">
                  <div className="text-5xl">{item.icon}</div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-gray-900 mb-3">
                      {item.industry}
                    </h4>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 font-medium mb-1">
                        Challenge:
                      </p>
                      <p className="text-gray-700">{item.challenge}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">
                        Noor Solution:
                      </p>
                      <p className="text-green-700 font-semibold">
                        {item.solution}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Impact */}
        <div className="bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl p-12 shadow-2xl text-white">
          <h3 className="text-3xl font-bold mb-8 text-center">
            Social & Environmental Impact
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-5xl mb-4">💚</div>
              <h4 className="font-bold mb-2">Zakat Automation</h4>
              <p className="text-sm opacity-90">
                Fair distribution and traceability guaranteed
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🏛️</div>
              <h4 className="font-bold mb-2">Waqf Digitization</h4>
              <p className="text-sm opacity-90">
                Perpetual charitable assets on-chain
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🌱</div>
              <h4 className="font-bold mb-2">Green Sukuk</h4>
              <p className="text-sm opacity-90">
                Funds renewable projects and carbon offsets
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🤝</div>
              <h4 className="font-bold mb-2">Financial Inclusion</h4>
              <p className="text-sm opacity-90">
                Micro-savings for the unbanked
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">
            Join the Movement
          </h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Build a fair and transparent global Islamic financial ecosystem with
            NorChain
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://docs.norchain.org"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-green-600 transition-all shadow-lg hover:shadow-xl"
            >
              Explore Documentation
            </a>
            <a
              href="#contact"
              className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold border-2 border-gray-300 hover:border-blue-500 transition-all shadow-lg hover:shadow-xl"
            >
              Partner With Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
