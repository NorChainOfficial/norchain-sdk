"use client";

import { useState } from "react";

interface CodeExample {
  readonly language: string;
  readonly title: string;
  readonly code: string;
}

export default function DeveloperQuickStart(): JSX.Element {
  const [activeTab, setActiveTab] = useState(0);

  const codeExamples: readonly CodeExample[] = [
    {
      language: "javascript",
      title: "Connect to NorChain",
      code: `import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(
  'https://rpc.norchain.org',
  { name: 'NorChain', chainId: 65001 }
);

const latestBlock = await provider.getBlockNumber();
console.log('Latest block:', latestBlock);`,
    },
    {
      language: "javascript", 
      title: "Send Transaction",
      code: `const wallet = new ethers.Wallet(privateKey, provider);

const tx = await wallet.sendTransaction({
  to: '0x742d35Cc6634C0532925a3b8D9A5d4c9',
  value: ethers.parseEther('1.0'),
  gasLimit: 21000
});

console.log('Transaction hash:', tx.hash);
const receipt = await tx.wait();`,
    },
    {
      language: "javascript",
      title: "Deploy Smart Contract",
      code: `const contractFactory = new ethers.ContractFactory(
  abi, bytecode, wallet
);

const contract = await contractFactory.deploy(
  'Hello NorChain',
  { gasLimit: 1000000 }
);

await contract.waitForDeployment();
console.log('Contract deployed:', contract.target);`,
    },
    {
      language: "python",
      title: "Python Web3 Integration",
      code: `from web3 import Web3

w3 = Web3(Web3.HTTPProvider('https://rpc.norchain.org'))

# Check connection
print(f"Connected: {w3.is_connected()}")
print(f"Latest block: {w3.eth.block_number}")

# Get account balance
balance = w3.eth.get_balance('0x742d35Cc...')
print(f"Balance: {w3.from_wei(balance, 'ether')} NOR")`,
    },
  ] as const;

  return (
    <section id="developer-tools" className="py-20 bg-gradient-to-b from-black via-gray-950 to-black scroll-mt-20 relative overflow-hidden">
      {/* Background elements inspired by Dribbble designs */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-[600px] h-[600px] bg-gradient-to-br from-emerald-500/10 via-cyan-500/15 to-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-gradient-to-tl from-violet-500/10 via-purple-500/15 to-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Bold Dribbble-inspired section header */}
        <div className="text-center mb-24">
          <div className="relative inline-block mb-8">
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white">
              Quick Start
            </h2>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 rounded-full" />
          </div>
          <p className="text-2xl text-gray-400 font-light max-w-4xl mx-auto leading-relaxed">
            Get up and running with NorChain infrastructure using familiar tools and APIs
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Modern stats grid with glassmorphism */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              { value: "99.9%", label: "API Uptime", color: "from-emerald-400 to-cyan-500", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
              { value: "<85ms", label: "Response Time", color: "from-blue-400 to-violet-500", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
              { value: "3s", label: "Block Time", color: "from-violet-400 to-purple-500", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
              { value: "127+", label: "Active Developers", color: "from-cyan-400 to-blue-500", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" }
            ].map((stat, index) => (
              <div key={index} className="group text-center hover:scale-105 transition-all duration-300">
                <div className="relative mb-6">
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300`} />
                  <div className="relative bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 hover:bg-gray-900/60 hover:border-gray-600/70 transition-all duration-300 shadow-2xl">
                    <div className={`h-16 w-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon}/>
                      </svg>
                    </div>
                    <div className={`text-3xl font-black mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-400 font-medium tracking-wider uppercase">
                      {stat.label}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Modern code examples with glassmorphism */}
          <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden mb-16">
            {/* Enhanced tab navigation */}
            <div className="border-b border-gray-700/50">
              <nav className="flex space-x-8 px-8" aria-label="Code examples">
                {codeExamples.map((example, index) => (
                  <button
                    key={example.title}
                    onClick={() => setActiveTab(index)}
                    className={`py-6 px-1 border-b-2 font-semibold text-sm transition-all duration-300 ${
                      activeTab === index
                        ? 'border-cyan-400 text-cyan-400'
                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                    }`}
                    aria-selected={activeTab === index}
                    role="tab"
                  >
                    {example.title}
                  </button>
                ))}
              </nav>
            </div>

            {/* Enhanced code display */}
            <div className="p-8">
              <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-8 border border-gray-800/50 overflow-x-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <span className="text-gray-400 text-sm font-medium ml-4">
                      {codeExamples[activeTab].language}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(codeExamples[activeTab].code);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800/80 hover:bg-gray-700/80 text-cyan-400 hover:text-cyan-300 text-sm rounded-xl transition-all duration-300 font-medium shadow-lg"
                    aria-label={`Copy ${codeExamples[activeTab].title} code`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                    Copy
                  </button>
                </div>
                <pre className="text-cyan-100 text-sm leading-relaxed overflow-x-auto">
                  <code>{codeExamples[activeTab].code}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Modern action buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 rounded-2xl blur opacity-75"></div>
              <a
                href="https://docs.norchain.org/getting-started"
                target="_blank"
                rel="noopener noreferrer"
                className="relative group inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 text-white font-bold text-lg rounded-2xl hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-500 hover:scale-105"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
                <span>View Documentation</span>
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                
                {/* Button overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              </a>
            </div>
            
            <a
              href="https://api.norchain.org/api-docs"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 px-12 py-5 bg-gray-800/60 backdrop-blur-xl border-2 border-gray-600/50 text-gray-300 hover:text-white font-bold text-lg rounded-2xl transition-all duration-300 hover:bg-gray-700/60 hover:border-gray-500/70 shadow-lg hover:shadow-xl"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m18 4l4 4-4 4M6 16l-4-4 4-4"/>
              </svg>
              <span>API Reference</span>
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* Enhanced floating elements */}
          <div className="absolute top-32 left-32 w-3 h-3 bg-cyan-400 rounded-full animate-pulse opacity-60" />
          <div className="absolute top-52 right-40 w-2 h-2 bg-emerald-400 rounded-full animate-pulse opacity-50" style={{animationDelay: '1s'}} />
          <div className="absolute bottom-32 left-40 w-4 h-4 bg-blue-400 rounded-lg rotate-45 animate-pulse opacity-40" style={{animationDelay: '2s'}} />
          <div className="absolute bottom-52 right-32 w-2 h-2 bg-violet-400 rounded-full animate-pulse opacity-60" style={{animationDelay: '3s'}} />
        </div>
      </div>
    </section>
  );
}