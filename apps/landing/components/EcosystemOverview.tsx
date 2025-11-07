"use client";

import { useState } from "react";

interface EcosystemComponent {
  readonly name: string;
  readonly purpose: string;
  readonly icon: string;
  readonly color: string;
}

export default function EcosystemOverview() {
  const [activeComponent, setActiveComponent] = useState<string | null>(null);

  const ecosystemComponents: readonly EcosystemComponent[] = [
    {
      name: "NorChain (L1)",
      purpose: "Core blockchain running PoSA (Parlia) consensus with 3s blocks and 10,000-block epochs",
      icon: "⛓️",
      color: "from-blue-600 to-blue-700",
    },
    {
      name: "Dirhamat",
      purpose: "Shariah-compliant stable-asset representing UAE Dirham and vaulted gold",
      icon: "🪙",
      color: "from-amber-600 to-amber-700",
    },
    {
      name: "Digital KES",
      purpose: "Stable digital Kenyan Shilling aligned with CBK sandbox regulations",
      icon: "🇰🇪",
      color: "from-green-600 to-green-700",
    },
    {
      name: "NordCoin",
      purpose: "Nordic-compliant currency focused on ESG reporting and EU MiCA alignment",
      icon: "🌊",
      color: "from-cyan-600 to-cyan-700",
    },
    {
      name: "NoorSwap (DEX)",
      purpose: "Native decentralized exchange with hybrid liquidity routing and $800K locked liquidity",
      icon: "🔄",
      color: "from-purple-600 to-purple-700",
    },
    {
      name: "Noor Bridge",
      purpose: "Cross-chain vault and router system linking Noor with BSC, Polygon, Ethereum",
      icon: "🌉",
      color: "from-indigo-600 to-indigo-700",
    },
    {
      name: "Noor Funds",
      purpose: "On-chain halal mutual and retirement funds for ethical investing",
      icon: "💼",
      color: "from-emerald-600 to-emerald-700",
    },
    {
      name: "Compliance Core (XCC)",
      purpose: "Smart-contract framework for AML/KYC/GDPR/AAOIFI rules",
      icon: "🛡️",
      color: "from-red-600 to-red-700",
    },
    {
      name: "Noor AI Agents",
      purpose: "Autonomous agents handling liquidity, compliance, and governance automation",
      icon: "🤖",
      color: "from-pink-600 to-pink-700",
    },
  ] as const;

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Complete Financial Ecosystem
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            NorChain is the anchor of a complete financial and technological
            ecosystem—bridging fiat, gold, digital assets, and AI-driven
            governance.
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Each component interoperates through unified standards and the Noor
            AI protocol layer for predictive management.
          </p>
        </div>

        {/* Ecosystem Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {ecosystemComponents.map((component) => (
            <div
              key={component.name}
              className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 ${
                activeComponent === component.name
                  ? "border-blue-500 scale-105"
                  : "border-transparent hover:border-blue-200"
              }`}
              onClick={() =>
                setActiveComponent(
                  activeComponent === component.name ? null : component.name
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setActiveComponent(
                    activeComponent === component.name ? null : component.name
                  );
                }
              }}
              role="button"
              tabIndex={0}
              aria-expanded={activeComponent === component.name}
              aria-label={`Learn more about ${component.name}`}
            >
              {/* Icon */}
              <div
                className={`h-16 w-16 bg-gradient-to-br ${component.color} rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-lg`}
              >
                {component.icon}
              </div>

              {/* Component Name */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {component.name}
              </h3>

              {/* Purpose */}
              <p className="text-gray-600 leading-relaxed">
                {component.purpose}
              </p>
            </div>
          ))}
        </div>

        {/* Key Technical Specs */}
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Technical Specifications
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                65001
              </div>
              <div className="text-sm text-gray-600 font-medium">Chain ID</div>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="text-4xl font-bold text-green-600 mb-2">3s</div>
              <div className="text-sm text-gray-600 font-medium">
                Block Time
              </div>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                21B
              </div>
              <div className="text-sm text-gray-600 font-medium">
                NOR Supply
              </div>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
              <div className="text-4xl font-bold text-amber-600 mb-2">
                3 + 2
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Validators
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl">
              <div className="text-2xl font-bold text-indigo-600 mb-2">
                &lt;30s
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Finality Time
              </div>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl">
              <div className="text-2xl font-bold text-pink-600 mb-2">
                10,000
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Blocks per Epoch
              </div>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl">
              <div className="text-2xl font-bold text-cyan-600 mb-2">PoSA</div>
              <div className="text-sm text-gray-600 font-medium">
                Consensus Engine
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
