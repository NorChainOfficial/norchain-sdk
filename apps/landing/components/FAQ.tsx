"use client";

import { useState } from "react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      category: "General",
      questions: [
        {
          q: "What is NorChain?",
          a: "Nor is an EVM-compatible blockchain designed for speed, affordability, and social impact. We offer 3-second block times, sub-cent transaction fees, and automatically donate 5% of all network fees to verified charitable causes.",
        },
        {
          q: "How is Nor different from Ethereum?",
          a: "Nor is 20x faster (3s vs 12s blocks), 10,000x cheaper (<$0.001 vs $5-50 fees), and includes built-in charitable giving. We're fully EVM-compatible, so you can use the same tools and deploy the same contracts.",
        },
        {
          q: "Is Nor truly decentralized?",
          a: "NorChain uses Proof of Stake (PoS) consensus with 500+ validators globally. Validators stake NOR tokens to secure the network and earn rewards, enabling ultra-low fees and fast finality while maintaining decentralization.",
        },
      ],
    },
    {
      category: "For Developers",
      questions: [
        {
          q: "Can I deploy my Ethereum contracts on Nor?",
          a: "Yes! Nor is 100% EVM-compatible. Simply change your RPC endpoint to Nor and deploy with zero code changes. All Ethereum tools work: Hardhat, Truffle, Remix, MetaMask, Web3.js, Ethers.js.",
        },
        {
          q: "What programming languages does Nor support?",
          a: "Solidity and Vyper (same as Ethereum). Our SDK supports JavaScript/TypeScript, Python, Go, and Rust.",
        },
        {
          q: "Are there developer incentives?",
          a: "Yes! We offer grants up to $50k for high-impact dApps, free RPC access, technical support, and marketing assistance. Apply at dev.norchain.org/grants",
        },
      ],
    },
    {
      category: "Charity & Impact",
      questions: [
        {
          q: "How does the charity mechanism work?",
          a: "5% of all transaction fees are automatically sent to a multi-sig charity wallet controlled by verified non-profits. Distributions are transparent and tracked on-chain. We've donated $164k+ to date.",
        },
        {
          q: "Which charities do you support?",
          a: "We focus on four areas: Education (40%), Environmental Sustainability (30%), Hunger Relief (20%), and Medical Aid (10%). Partners include established NGOs with proven track records.",
        },
        {
          q: "Can I verify charity donations?",
          a: "Absolutely! All donations are public on-chain. Visit explorer.norchain.org/charity to see real-time distributions, recipient addresses, and independent audit reports.",
        },
      ],
    },
    {
      category: "Getting Started",
      questions: [
        {
          q: "How do I add Nor to MetaMask?",
          a: 'Click "Add to MetaMask" at the top of this page, or manually add: Chain ID 65001, RPC https://rpc.norchain.org, Symbol NOR.',
        },
        {
          q: "Where can I get NOR tokens?",
          a: "Buy NOR on NorSwap (our DEX), bridge from Ethereum using our official bridge, or receive from faucet for testing (testnet.norchain.org/faucet).",
        },
        {
          q: "What can I do on Nor?",
          a: "Trade on DEXs, stake for rewards, participate in governance, bridge assets, crowdfund projects, create NFTs, and build dApps. Our ecosystem is growing daily!",
        },
      ],
    },
    {
      category: "Technical",
      questions: [
        {
          q: "What consensus mechanism does Nor use?",
          a: "Proof of Stake (PoS) with 500+ validators. Validators stake NOR tokens to secure the network, enabling fast finality and low fees while maintaining true decentralization.",
        },
        {
          q: "Is Nor secure?",
          a: "Yes. We use battle-tested Geth (Go Ethereum) infrastructure, undergo regular security audits, and have a bug bounty program. All smart contracts are audited before deployment.",
        },
        {
          q: "What are the network specs?",
          a: "Block time: 3s, Gas limit: 30M, TPS: 1000+, Finality: 3s, EVM version: Shanghai, Native token: NOR (18 decimals).",
        },
      ],
    },
  ];

  return (
    <section id="faq" className="py-20 bg-gradient-to-b from-black via-gray-950 to-black scroll-mt-20 relative overflow-hidden">
      {/* Background elements inspired by Dribbble designs */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-[600px] h-[600px] bg-gradient-to-br from-pink-500/10 via-rose-500/15 to-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-gradient-to-tl from-purple-500/10 via-pink-500/15 to-rose-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Bold Dribbble-inspired section header */}
        <div className="text-center mb-24">
          <div className="relative inline-block mb-8">
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white">
              FAQ
            </h2>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1.5 bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 rounded-full" />
          </div>
          <p className="text-2xl text-gray-400 font-light max-w-4xl mx-auto leading-relaxed">
            Everything you need to know about NorChain
          </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-12">
          {faqs.map((category, categoryIndex) => (
            <div key={category.category} className="group">
              {/* Modern category header */}
              <h3 className="text-3xl font-bold text-white mb-8 flex items-center">
                <div className="relative mr-6">
                  <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl blur opacity-30" />
                  <div className="relative bg-gradient-to-r from-pink-500 to-rose-500 w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg">
                    {categoryIndex + 1}
                  </div>
                </div>
                <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                  {category.category}
                </span>
              </h3>
              
              {/* Modern FAQ cards */}
              <div className="space-y-6">
                {category.questions.map((faq, questionIndex) => {
                  const globalIndex = categoryIndex * 10 + questionIndex;
                  const isOpen = openIndex === globalIndex;

                  return (
                    <div
                      key={questionIndex}
                      className="group/item relative"
                    >
                      {/* Glassmorphism FAQ card */}
                      <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl overflow-hidden shadow-2xl hover:bg-gray-900/60 hover:border-gray-600/70 transition-all duration-300">
                        <button
                          onClick={() =>
                            setOpenIndex(isOpen ? null : globalIndex)
                          }
                          className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-800/30 transition-all duration-300"
                        >
                          <span className="font-semibold text-white pr-8 text-lg leading-relaxed group-hover/item:text-pink-300 transition-colors duration-300">
                            {faq.q}
                          </span>
                          <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl blur opacity-20 group-hover/item:opacity-40 transition-opacity duration-300" />
                            <div className="relative h-10 w-10 bg-gray-800/60 backdrop-blur-sm border border-gray-600/40 rounded-xl flex items-center justify-center">
                              <svg
                                className={`w-5 h-5 text-pink-400 flex-shrink-0 transition-all duration-300 ${
                                  isOpen ? "rotate-180" : ""
                                }`}
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
                            </div>
                          </div>
                        </button>
                        
                        {/* Enhanced answer section */}
                        <div className={`transition-all duration-500 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                          <div className="px-8 pb-6 border-t border-gray-700/50">
                            <p className="text-gray-300 leading-relaxed text-base pt-6">
                              {faq.a}
                            </p>
                          </div>
                        </div>

                        {/* Bottom accent line */}
                        <div className={`h-1 bg-gradient-to-r from-pink-500 to-rose-500 transform transition-transform duration-500 ${
                          isOpen ? 'scale-x-100' : 'scale-x-0'
                        } rounded-b-3xl`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Modern CTA section */}
        <div className="mt-20 text-center">
          <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-10 max-w-3xl mx-auto shadow-2xl">
            <h3 className="text-3xl font-bold text-white mb-6">
              Still have questions?
            </h3>
            <p className="text-gray-400 mb-10 text-lg leading-relaxed">
              Join our community or check out our comprehensive documentation
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl blur opacity-75"></div>
                <a
                  href="https://discord.gg/GjXguAsN"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative group inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold text-lg rounded-2xl hover:shadow-2xl hover:shadow-pink-500/30 transition-all duration-500 hover:scale-105"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                  <span>Join Discord</span>
                  
                  {/* Button overlay effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                </a>
              </div>
              
              <a
                href="https://docs.norchain.org"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 px-12 py-5 bg-gray-800/60 backdrop-blur-xl border-2 border-gray-600/50 text-gray-300 hover:text-white font-bold text-lg rounded-2xl transition-all duration-300 hover:bg-gray-700/60 hover:border-gray-500/70 shadow-lg hover:shadow-xl"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
                <span>Read Documentation</span>
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Enhanced floating elements */}
        <div className="absolute top-40 left-40 w-3 h-3 bg-pink-400 rounded-full animate-pulse opacity-60" />
        <div className="absolute top-60 right-32 w-2 h-2 bg-rose-400 rounded-full animate-pulse opacity-50" style={{animationDelay: '1s'}} />
        <div className="absolute bottom-40 left-20 w-4 h-4 bg-red-400 rounded-lg rotate-45 animate-pulse opacity-40" style={{animationDelay: '2s'}} />
        <div className="absolute bottom-60 right-40 w-2 h-2 bg-purple-400 rounded-full animate-pulse opacity-60" style={{animationDelay: '3s'}} />
      </div>
    </section>
  );
}
