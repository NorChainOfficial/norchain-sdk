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
          a: "Noor is an EVM-compatible blockchain designed for speed, affordability, and social impact. We offer 3-second block times, sub-cent transaction fees, and automatically donate 5% of all network fees to verified charitable causes.",
        },
        {
          q: "How is Noor different from Ethereum?",
          a: "Noor is 20x faster (3s vs 12s blocks), 10,000x cheaper (<$0.001 vs $5-50 fees), and includes built-in charitable giving. We're fully EVM-compatible, so you can use the same tools and deploy the same contracts.",
        },
        {
          q: "Is Noor truly decentralized?",
          a: "Noor uses Proof of Authority (PoA) consensus with 500+ validators globally. While more centralized than Ethereum's PoS, this enables our ultra-low fees and fast finality. We're working toward full decentralization by Q4 2025.",
        },
      ],
    },
    {
      category: "For Developers",
      questions: [
        {
          q: "Can I deploy my Ethereum contracts on Noor?",
          a: "Yes! Noor is 100% EVM-compatible. Simply change your RPC endpoint to Noor and deploy with zero code changes. All Ethereum tools work: Hardhat, Truffle, Remix, MetaMask, Web3.js, Ethers.js.",
        },
        {
          q: "What programming languages does Noor support?",
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
          q: "How do I add Noor to MetaMask?",
          a: 'Click "Add to MetaMask" at the top of this page, or manually add: Chain ID 65001, RPC https://rpc.norchain.org, Symbol NOR.',
        },
        {
          q: "Where can I get NOR tokens?",
          a: "Buy NOR on NoorSwap (our DEX), bridge from Ethereum using our official bridge, or receive from faucet for testing (testnet.norchain.org/faucet).",
        },
        {
          q: "What can I do on Noor?",
          a: "Trade on DEXs, stake for rewards, participate in governance, bridge assets, crowdfund projects, create NFTs, and build dApps. Our ecosystem is growing daily!",
        },
      ],
    },
    {
      category: "Technical",
      questions: [
        {
          q: "What consensus mechanism does Noor use?",
          a: "Proof of Authority (PoA) with 500+ validators. This enables our fast finality and low fees while maintaining security through reputable validator nodes.",
        },
        {
          q: "Is Noor secure?",
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
    <section id="faq" className="py-20 bg-gray-50 scroll-mt-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about Noor
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {faqs.map((category, categoryIndex) => (
            <div key={category.category}>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">
                  {categoryIndex + 1}
                </span>
                {category.category}
              </h3>
              <div className="space-y-3">
                {category.questions.map((faq, questionIndex) => {
                  const globalIndex = categoryIndex * 10 + questionIndex;
                  const isOpen = openIndex === globalIndex;

                  return (
                    <div
                      key={questionIndex}
                      className="bg-white rounded-lg shadow-md overflow-hidden transition-all"
                    >
                      <button
                        onClick={() =>
                          setOpenIndex(isOpen ? null : globalIndex)
                        }
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-semibold text-gray-900 pr-8">
                          {faq.q}
                        </span>
                        <svg
                          className={`w-5 h-5 text-blue-600 flex-shrink-0 transition-transform ${
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
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-4">
                          <p className="text-gray-600 leading-relaxed">
                            {faq.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-6">
            Join our community or check out our comprehensive documentation
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://discord.gg/norchain"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              Join Discord
            </a>
            <a
              href="https://docs.norchain.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-900 rounded-lg font-semibold hover:bg-gray-200 transition-all"
            >
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Read Docs
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
