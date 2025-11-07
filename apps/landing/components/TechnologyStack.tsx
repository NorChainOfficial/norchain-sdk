"use client";

export default function TechnologyStack() {
  const technologies = [
    {
      category: "Consensus",
      name: "Proof of Authority (PoA)",
      description:
        "Fast, efficient, and environmentally friendly consensus mechanism",
      icon: "⚙️",
    },
    {
      category: "Smart Contracts",
      name: "EVM Compatible",
      description:
        "Full Ethereum Virtual Machine compatibility with Solidity support",
      icon: "📜",
    },
    {
      category: "Infrastructure",
      name: "Go Ethereum (Geth)",
      description: "Built on battle-tested Ethereum infrastructure",
      icon: "🏗️",
    },
    {
      category: "Networking",
      name: "P2P Gossip Protocol",
      description: "Efficient peer-to-peer network communication",
      icon: "🌐",
    },
    {
      category: "Storage",
      name: "LevelDB",
      description: "High-performance key-value storage for blockchain data",
      icon: "💾",
    },
    {
      category: "APIs",
      name: "JSON-RPC & WebSocket",
      description: "Standard Ethereum APIs for seamless integration",
      icon: "🔌",
    },
  ];

  const tools = [
    { name: "MetaMask", logo: "🦊" },
    { name: "Hardhat", logo: "⚒️" },
    { name: "Truffle", logo: "🍫" },
    { name: "Remix", logo: "🎛️" },
    { name: "Web3.js", logo: "🌐" },
    { name: "Ethers.js", logo: "📚" },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 to-blue-900 text-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Technology Stack
          </h2>
          <p className="text-xl text-blue-200">
            Built on proven, production-ready blockchain technology
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {technologies.map((tech) => (
            <div
              key={tech.name}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{tech.icon}</div>
                <div>
                  <div className="text-sm text-blue-300 mb-1">
                    {tech.category}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{tech.name}</h3>
                  <p className="text-sm text-gray-300">{tech.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Compatible Tools */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h3 className="text-2xl font-bold text-center mb-8">
            Works with Your Favorite Tools
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {tools.map((tool) => (
              <div
                key={tool.name}
                className="bg-white/10 rounded-lg p-4 text-center hover:bg-white/20 transition-all"
              >
                <div className="text-4xl mb-2">{tool.logo}</div>
                <div className="text-sm font-semibold">{tool.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://docs.norchain.org/architecture"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-900 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg hover:scale-105"
            >
              Read Technical Architecture
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
              href="https://github.com/norchain/norchain-sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all shadow-lg hover:scale-105"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
