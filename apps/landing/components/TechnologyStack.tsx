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
    <section id="technology" className="py-32 bg-gradient-to-b from-black via-gray-950 to-black scroll-mt-8 relative overflow-hidden">
      {/* Background elements inspired by Dribbble designs */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-[600px] h-[600px] bg-gradient-to-br from-amber-500/10 via-orange-500/15 to-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-gradient-to-tl from-yellow-500/10 via-amber-500/15 to-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Bold Dribbble-inspired section header */}
        <div className="text-center mb-24">
          <div className="relative inline-block mb-8">
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white">
              Tech Stack
            </h2>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-full" />
          </div>
          <p className="text-2xl text-gray-400 font-light max-w-4xl mx-auto leading-relaxed">
            Built on proven, production-ready blockchain technology
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {technologies.map((tech, index) => (
            <div
              key={tech.name}
              className="group relative"
            >
              {/* Modern glassmorphism card */}
              <div className="relative bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 h-full transition-all duration-500 hover:bg-gray-900/60 hover:border-gray-600/70 hover:transform hover:scale-105 hover:-translate-y-2 shadow-2xl hover:shadow-3xl">
                
                {/* Dynamic gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-orange-500/10 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
                
                {/* Enhanced category badge */}
                <div className="relative mb-6">
                  <div className="inline-flex items-center px-4 py-2 bg-gray-800/60 backdrop-blur-sm border border-gray-600/40 text-gray-300 text-sm font-medium rounded-2xl shadow-lg">
                    {tech.category}
                  </div>
                </div>

                <div className="flex items-start gap-6 relative">
                  {/* Modern tech icon */}
                  <div className="relative">
                    <div className="absolute -inset-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                    <div className="relative text-5xl h-16 w-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                      {tech.icon}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-amber-300 transition-colors duration-300">
                      {tech.name}
                    </h3>
                    <p className="text-gray-400 text-base leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                      {tech.description}
                    </p>
                  </div>
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-3xl" />
              </div>

              {/* Floating elements around card */}
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-700 animate-pulse" />
              <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-700 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Modern compatible tools section */}
        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-10 shadow-2xl mb-16">
          <h3 className="text-3xl font-bold text-center mb-10 text-white">
            Works with Your Favorite Tools
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-8">
            {tools.map((tool, index) => (
              <div
                key={tool.name}
                className="group text-center transition-all duration-300 hover:scale-110"
              >
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative bg-gray-800/60 backdrop-blur-sm border border-gray-600/40 rounded-3xl p-6 hover:bg-gray-700/60 hover:border-gray-500/50 transition-all duration-300 shadow-lg">
                    <div className="text-4xl mb-2">{tool.logo}</div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-400 group-hover:text-gray-200 transition-colors duration-300">
                  {tool.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modern CTA Section */}
        <div className="text-center">
          <div className="relative inline-block">
            <div className="absolute -inset-6 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-3xl blur-xl opacity-20" />
            <a
              href="https://docs.norchain.org/architecture"
              target="_blank"
              rel="noopener noreferrer"
              className="relative group inline-flex items-center gap-4 px-16 py-6 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white rounded-3xl font-bold text-xl tracking-wide hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-500 hover:scale-105"
            >
              <span className="relative">Technical Architecture</span>
              <svg className="w-6 h-6 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              
              {/* Button overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
            </a>
          </div>
        </div>

        {/* Enhanced floating elements */}
        <div className="absolute top-40 left-40 w-3 h-3 bg-amber-400 rounded-full animate-pulse opacity-60" />
        <div className="absolute top-60 right-32 w-2 h-2 bg-orange-400 rounded-full animate-pulse opacity-50" style={{animationDelay: '1s'}} />
        <div className="absolute bottom-40 left-20 w-4 h-4 bg-red-400 rounded-lg rotate-45 animate-pulse opacity-40" style={{animationDelay: '2s'}} />
        <div className="absolute bottom-60 right-40 w-2 h-2 bg-yellow-400 rounded-full animate-pulse opacity-60" style={{animationDelay: '3s'}} />
      </div>
    </section>
  );
}
