"use client";

interface GovernanceRole {
  readonly role: string;
  readonly description: string;
  readonly icon: string;
  readonly color: string;
}

interface ComplianceStandard {
  readonly name: string;
  readonly description: string;
  readonly icon: string;
}

export default function GovernanceCompliance() {
  const governanceRoles: readonly GovernanceRole[] = [
    {
      role: "Validators",
      description:
        "3 active + 2 standby validators sign blocks; must maintain > 99% uptime; rotated every 10,000 blocks",
      icon: "🔐",
      color: "from-blue-600 to-indigo-600",
    },
    {
      role: "Governance Council",
      description:
        "Multisig (3 of 5) representatives from UAE, Kenya, Nordic institutions",
      icon: "🏛️",
      color: "from-purple-600 to-pink-600",
    },
    {
      role: "Community Delegators",
      description: "Stake NOR tokens to vote and earn rewards",
      icon: "🗳️",
      color: "from-green-600 to-emerald-600",
    },
    {
      role: "Compliance Observers",
      description: "Regulator-linked nodes auditing AML/KYC events",
      icon: "👁️",
      color: "from-red-600 to-orange-600",
    },
    {
      role: "AI Advisors",
      description:
        "Autonomous agents proposing parameter tuning (liquidity, epoch length, gas policy)",
      icon: "🤖",
      color: "from-cyan-600 to-blue-600",
    },
  ] as const;

  const complianceStandards: readonly ComplianceStandard[] = [
    {
      name: "GDPR",
      description: "EU General Data Protection Regulation compliance",
      icon: "🇪🇺",
    },
    {
      name: "AAOIFI",
      description:
        "Accounting and Auditing Organization for Islamic Financial Institutions",
      icon: "☪️",
    },
    {
      name: "NSM",
      description:
        "Norwegian Security Authority critical-infrastructure standards",
      icon: "🇳🇴",
    },
    {
      name: "ISO 27001",
      description: "Information security management systems",
      icon: "🔒",
    },
    {
      name: "CBK Sandbox",
      description: "Central Bank of Kenya regulatory sandbox",
      icon: "🇰🇪",
    },
    {
      name: "EU MiCA",
      description: "Markets in Crypto-Assets regulation alignment",
      icon: "🇪🇺",
    },
  ] as const;

  const philosophyPillars = [
    {
      title: "Ethical by Design",
      description:
        "No interest (riba), no gharar (excessive uncertainty), transparent risk-sharing",
      icon: "🤲",
      color: "from-emerald-500 to-green-600",
    },
    {
      title: "Compliant by Default",
      description:
        "GDPR, AAOIFI, NSM and ISO 27001 mapped into smart-contract templates",
      icon: "✅",
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "Intelligent by Architecture",
      description:
        "AI-driven validators, liquidity, and compliance agents",
      icon: "🧠",
      color: "from-purple-500 to-pink-600",
    },
    {
      title: "Inclusive by Access",
      description:
        "Publicly readable, permissionless use with verified-governance validators",
      icon: "🌍",
      color: "from-cyan-500 to-blue-600",
    },
    {
      title: "Sustainable by Operation",
      description: "Low-energy PoSA consensus + carbon-offset program",
      icon: "🌱",
      color: "from-green-500 to-teal-600",
    },
  ] as const;

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Governance & Compliance
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Public-Permissioned Governance structure ensuring transparency,
            accountability, and regulatory alignment
          </p>
        </div>

        {/* Core Philosophy */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-gray-900 mb-10 text-center">
            Core Philosophy
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {philosophyPillars.map((pillar) => (
              <div
                key={pillar.title}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div
                  className={`h-16 w-16 bg-gradient-to-br ${pillar.color} rounded-xl flex items-center justify-center text-4xl mb-4 shadow-md mx-auto`}
                >
                  {pillar.icon}
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-3 text-center">
                  {pillar.title}
                </h4>
                <p className="text-gray-600 text-sm text-center">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Governance Roles */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-gray-900 mb-10 text-center">
            Governance Participants
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {governanceRoles.map((roleItem) => (
              <div
                key={roleItem.role}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-200"
              >
                <div
                  className={`h-14 w-14 bg-gradient-to-br ${roleItem.color} rounded-xl flex items-center justify-center text-3xl mb-6 shadow-md`}
                >
                  {roleItem.icon}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">
                  {roleItem.role}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {roleItem.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <p className="text-gray-700 text-center">
              <strong>Decision Making:</strong> All decisions go through
              on-chain DAO proposals with weighted votes from council +
              delegators. AI Advisors provide predictive insights but cannot
              execute changes without human sign-off.
            </p>
          </div>
        </div>

        {/* Compliance Standards */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-gray-900 mb-10 text-center">
            Regulatory Compliance Standards
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complianceStandards.map((standard) => (
              <div
                key={standard.name}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-gray-100 hover:border-green-200"
              >
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{standard.icon}</div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      {standard.name}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {standard.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Baseline */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 shadow-lg mb-20">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Security & Compliance Baseline
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-3xl mb-3">🛡️</div>
              <h4 className="font-bold text-gray-900 mb-2">
                Infrastructure Security
              </h4>
              <p className="text-gray-600 text-sm">
                All nodes run under NSM critical-infrastructure standards with
                validator signers in HSM (ISO 27001)
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-3xl mb-3">🔍</div>
              <h4 className="font-bold text-gray-900 mb-2">
                Regular Auditing
              </h4>
              <p className="text-gray-600 text-sm">
                Penetration testing every quarter (OWASP + smart-contract
                audit) with third-party verification
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-3xl mb-3">🤖</div>
              <h4 className="font-bold text-gray-900 mb-2">
                AI Security Monitoring
              </h4>
              <p className="text-gray-600 text-sm">
                Continuous monitoring via AI Security Agent flagging anomalies
                in real-time
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-3xl mb-3">✅</div>
              <h4 className="font-bold text-gray-900 mb-2">
                Transaction Compliance
              </h4>
              <p className="text-gray-600 text-sm">
                Compliance Core ensures transactions respect jurisdiction rules
                and AML/KYC requirements
              </p>
            </div>
          </div>
        </div>

        {/* Validator Requirements */}
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Validator Requirements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">💰</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">
                    Minimum Stake
                  </h4>
                  <p className="text-gray-600 text-sm">
                    ≥ 10,000,000 NOR bonded (self + delegations)
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">⏱️</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Uptime SLA</h4>
                  <p className="text-gray-600 text-sm">
                    &gt; 99% uptime with redundant infrastructure
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold">🌐</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">
                    Public Endpoint
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Public RPC + monitoring endpoint
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 font-bold">🔐</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">
                    Security Compliance
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Audited validator key custody per NSM security guidelines
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
