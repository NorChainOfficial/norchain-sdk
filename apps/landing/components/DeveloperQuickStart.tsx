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
    <section id="developer-tools" className="py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Start Building in Minutes
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Get up and running with NorChain infrastructure using familiar tools and APIs.
            Our Ethereum-compatible endpoints make integration seamless.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="text-center">
                <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">99.9%</div>
                <div className="text-sm text-gray-600">API Uptime</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="text-center">
                <div className="h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">&lt;85ms</div>
                <div className="text-sm text-gray-600">Response Time</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="text-center">
                <div className="h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">3s</div>
                <div className="text-sm text-gray-600">Block Time</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="text-center">
                <div className="h-12 w-12 bg-amber-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">127+</div>
                <div className="text-sm text-gray-600">Active Developers</div>
              </div>
            </div>
          </div>

          {/* Code Examples */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Code examples">
                {codeExamples.map((example, index) => (
                  <button
                    key={example.title}
                    onClick={() => setActiveTab(index)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === index
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    aria-selected={activeTab === index}
                    role="tab"
                  >
                    {example.title}
                  </button>
                ))}
              </nav>
            </div>

            {/* Code Display */}
            <div className="p-6">
              <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 text-sm font-medium">
                    {codeExamples[activeTab].language}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(codeExamples[activeTab].code);
                    }}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-md transition-colors"
                    aria-label={`Copy ${codeExamples[activeTab].title} code`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                    Copy
                  </button>
                </div>
                <pre className="text-gray-300 text-sm leading-relaxed overflow-x-auto">
                  <code>{codeExamples[activeTab].code}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-6 mt-12">
            <a
              href="https://docs.norchain.org/getting-started"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-2xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
              View Full Documentation
            </a>
            
            <a
              href="https://api.norchain.org/api-docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-700 font-bold text-lg rounded-2xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-gray-300"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m18 4l4 4-4 4M6 16l-4-4 4-4"/>
              </svg>
              Explore API Reference
            </a>

            <a
              href="https://testnet.norchain.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-700 font-bold text-lg rounded-2xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-gray-300"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547A8.014 8.014 0 004 21h4.722a8.014 8.014 0 00.962-3.428L10 16.5l.316 1.072A8.014 8.014 0 0011.278 21H16a8.014 8.014 0 00-.244-5.572z"/>
              </svg>
              Access Test Network
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}