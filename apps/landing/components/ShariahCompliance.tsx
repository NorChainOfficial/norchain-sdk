"use client";

interface ShariahFeature {
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly verse?: string;
}

export default function ShariahCompliance() {
  const shariahPrinciples: readonly ShariahFeature[] = [
    {
      title: "No Riba (Interest-Free)",
      description:
        "Zero interest-based transactions. All profits come from legitimate trade, profit-sharing (Mudarabah), or asset-backed financing (Murabaha).",
      icon: "🚫💰",
      verse: '"Allah has permitted trade and forbidden riba (interest)" - Quran 2:275',
    },
    {
      title: "No Gharar (No Uncertainty)",
      description:
        "Transparent contracts with clear terms. No gambling, speculation, or excessive uncertainty in transactions.",
      icon: "✨",
      verse: '"O believers! Do not devour one another\'s wealth illegally" - Quran 4:29',
    },
    {
      title: "Asset-Backed Only",
      description:
        "Every token represents real assets: gold, real estate, commodities, or equity. No unbacked speculation.",
      icon: "🏗️",
    },
    {
      title: "Profit & Loss Sharing",
      description:
        "Risk-sharing between parties (Musharakah/Mudarabah). Fair distribution of profits and losses.",
      icon: "🤝",
    },
    {
      title: "Zakat Automation",
      description:
        "Automatic 2.5% yearly purification calculated and directed to charity. Built into smart contracts.",
      icon: "💚",
      verse: '"Establish prayer and give zakah" - Quran 2:43',
    },
    {
      title: "Halal Activities Only",
      description:
        "No alcohol, gambling, tobacco, weapons, or haram industries. Shariah Oracle validates all contracts.",
      icon: "✅",
    },
  ] as const;

  const complianceStandards: readonly ShariahFeature[] = [
    {
      title: "AAOIFI Certified",
      description:
        "Accounting and Auditing Organization for Islamic Financial Institutions standards",
      icon: "📜",
    },
    {
      title: "Shariah Oracle",
      description:
        "On-chain registry of approved assets, contracts, and fatwas from certified scholars",
      icon: "🕌",
    },
    {
      title: "Regular Audits",
      description:
        "Quarterly Shariah compliance audits by certified Islamic finance scholars",
      icon: "🔍",
    },
    {
      title: "Transparent Fatwas",
      description:
        "All Shariah rulings published on-chain with scholar signatures and reasoning",
      icon: "📖",
    },
  ] as const;

  const islamicProducts = [
    {
      name: "Murabaha",
      description: "Cost-plus financing for trade and purchases",
      example: "Buy property/assets, pay in installments with disclosed markup",
      icon: (
        <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#10B981" opacity="0.1"/>
          <path d="M32 16V32L42 42" stroke="#10B981" strokeWidth="3" strokeLinecap="round"/>
          <circle cx="32" cy="32" r="14" stroke="#10B981" strokeWidth="3"/>
          <path d="M20 28H16M48 28H44M32 16V12M32 52V48" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      name: "Mudarabah",
      description: "Profit-sharing investment partnership",
      example: "Investor provides capital, entrepreneur manages, profits shared",
      icon: (
        <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#3B82F6" opacity="0.1"/>
          <path d="M20 38C20 38 24 30 32 30C40 30 44 38 44 38" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round"/>
          <circle cx="24" cy="24" r="4" fill="#3B82F6"/>
          <circle cx="40" cy="24" r="4" fill="#3B82F6"/>
          <path d="M28 40L32 44L36 40" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      name: "Musharakah",
      description: "Joint venture partnership with shared ownership",
      example: "Multiple parties invest together, share profits and losses",
      icon: (
        <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#8B5CF6" opacity="0.1"/>
          <circle cx="22" cy="26" r="6" stroke="#8B5CF6" strokeWidth="2.5"/>
          <circle cx="42" cy="26" r="6" stroke="#8B5CF6" strokeWidth="2.5"/>
          <path d="M18 38H26M38 38H46M28 38H36" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round"/>
          <circle cx="32" cy="44" r="3" fill="#8B5CF6"/>
        </svg>
      ),
    },
    {
      name: "Ijara",
      description: "Islamic leasing with ownership option",
      example: "Lease-to-own real estate with monthly rental payments",
      icon: (
        <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#F59E0B" opacity="0.1"/>
          <path d="M16 32L32 18L48 32" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="22" y="32" width="20" height="16" stroke="#F59E0B" strokeWidth="3"/>
          <path d="M28 48V40H36V48" stroke="#F59E0B" strokeWidth="2.5"/>
          <circle cx="40" cy="38" r="1.5" fill="#F59E0B"/>
        </svg>
      ),
    },
    {
      name: "Sukuk",
      description: "Islamic bonds backed by tangible assets",
      example: "Invest in infrastructure projects with asset-backed returns",
      icon: (
        <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#EC4899" opacity="0.1"/>
          <rect x="18" y="22" width="28" height="20" rx="2" stroke="#EC4899" strokeWidth="3"/>
          <path d="M18 30H46" stroke="#EC4899" strokeWidth="2"/>
          <circle cx="26" cy="26" r="2" fill="#EC4899"/>
          <path d="M32 34H40M32 38H38" stroke="#EC4899" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      name: "Takaful",
      description: "Mutual insurance based on cooperation",
      example: "Pooled risk protection without gambling elements",
      icon: (
        <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#14B8A6" opacity="0.1"/>
          <path d="M32 18C32 18 24 22 24 30C24 38 32 46 32 46C32 46 40 38 40 30C40 22 32 18 32 18Z" stroke="#14B8A6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M28 30L30.5 33L36 27" stroke="#14B8A6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      name: "Waqf",
      description: "Perpetual charitable endowment",
      example: "Create permanent charity funds that generate ongoing benefits",
      icon: (
        <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#6366F1" opacity="0.1"/>
          <path d="M32 16V28M32 28C28 28 24 30 24 34V44H40V34C40 30 36 28 32 28Z" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M20 44H44" stroke="#6366F1" strokeWidth="3" strokeLinecap="round"/>
          <circle cx="32" cy="22" r="3" fill="#6366F1"/>
        </svg>
      ),
    },
  ] as const;

  return (
    <section className="py-24 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="text-6xl mb-6">☪️</div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            The World's First Shariah-Compliant Blockchain
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Built from the ground up to align with Islamic finance principles
            and Shariah law. Every transaction, every contract, every feature
            designed for halal finance.
          </p>
        </div>

        {/* Core Shariah Principles */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-gray-900 mb-10 text-center">
            Core Shariah Principles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {shariahPrinciples.map((principle) => (
              <div
                key={principle.title}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-emerald-100 hover:border-emerald-400"
              >
                <div className="text-5xl mb-4">{principle.icon}</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  {principle.title}
                </h4>
                <p className="text-gray-600 mb-4">{principle.description}</p>
                {principle.verse && (
                  <div className="mt-4 pt-4 border-t border-emerald-200">
                    <p className="text-sm text-emerald-700 italic">
                      {principle.verse}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Islamic Finance Products */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-gray-900 mb-10 text-center">
            Islamic Finance Products Available
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {islamicProducts.map((product) => (
              <div
                key={product.name}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-emerald-100 hover:border-emerald-400 group"
              >
                <div className="flex items-start space-x-6">
                  {/* SVG Icon */}
                  <div className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    {product.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-emerald-700 mb-3 group-hover:text-emerald-600 transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-gray-900 text-base font-medium mb-3">
                      {product.description}
                    </p>
                    <div className="pt-3 border-t border-emerald-100">
                      <p className="text-sm text-gray-600 italic">
                        <span className="font-semibold text-emerald-600">
                          Example:
                        </span>{" "}
                        {product.example}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance & Oversight */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-gray-900 mb-10 text-center">
            Shariah Compliance & Oversight
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {complianceStandards.map((standard) => (
              <div
                key={standard.title}
                className="bg-white rounded-xl p-6 shadow-lg text-center hover:shadow-xl transition-all"
              >
                <div className="text-4xl mb-4">{standard.icon}</div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {standard.title}
                </h4>
                <p className="text-gray-600 text-sm">{standard.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Differentiators */}
        <div className="bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl p-12 shadow-2xl text-white">
          <h3 className="text-3xl font-bold mb-8 text-center">
            Why NorChain for Islamic Finance?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="text-4xl">🕋</div>
              <div>
                <h4 className="font-bold mb-2 text-xl">
                  Shariah by Architecture
                </h4>
                <p className="text-emerald-100">
                  Not just compliant—built from the ground up with Islamic
                  finance principles in the core protocol. Impossible to violate
                  Shariah rules.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="text-4xl">⚡</div>
              <div>
                <h4 className="font-bold mb-2 text-xl">Modern Technology</h4>
                <p className="text-emerald-100">
                  3-second blocks, sub-cent fees, EVM compatibility. Ancient
                  wisdom meets cutting-edge blockchain technology.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="text-4xl">🌍</div>
              <div>
                <h4 className="font-bold mb-2 text-xl">
                  Emerging Markets Focus
                </h4>
                <p className="text-emerald-100">
                  Built for UAE, Kenya, Nordic regions, and Southeast Asia.
                  Connecting 1.8 billion Muslims to ethical finance.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="text-4xl">🤝</div>
              <div>
                <h4 className="font-bold mb-2 text-xl">
                  Institutional Grade
                </h4>
                <p className="text-emerald-100">
                  AAOIFI certified, ISO 27001 compliant, audited by Islamic
                  scholars. Ready for banks, governments, and enterprises.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Zakat Calculator CTA */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-xl max-w-2xl mx-auto">
            <div className="text-5xl mb-4">💚</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Automatic Zakat Calculation
            </h3>
            <p className="text-gray-600 mb-6">
              Your zakat is automatically calculated at 2.5% annually and can be
              directed to verified charitable causes. Transparent, immutable,
              and Shariah-compliant.
            </p>
            <a
              href="https://docs.norchain.org/zakat"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
            >
              Learn About Zakat on NorChain
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
