"use client";

import Link from "next/link";

export default function Footer() {
  const footerSections = [
    {
      title: "Product",
      links: [
        {
          name: "Explorer",
          href: "https://explorer.norchain.org",
          external: true,
        },
        {
          name: "Documentation",
          href: "https://docs.norchain.org",
          external: true,
        },
        {
          name: "GitHub",
          href: "https://github.com/norchain/norchain-sdk",
          external: true,
        },
        { name: "Roadmap", href: "#roadmap", scroll: true },
        { name: "FAQ", href: "#faq", scroll: true },
      ],
    },
    {
      title: "Developers",
      links: [
        {
          name: "Documentation",
          href: "https://docs.norchain.org",
          external: true,
        },
        {
          name: "API Reference",
          href: "https://docs.norchain.org/api",
          external: true,
        },
        {
          name: "SDK",
          href: "https://github.com/norchain/norchain-sdk",
          external: true,
        },
        { name: "GitHub", href: "https://github.com/norchain", external: true },
        {
          name: "NPM Package",
          href: "https://www.npmjs.com/package/@noor/core",
          external: true,
        },
      ],
    },
    {
      title: "Resources",
      links: [
        {
          name: "Whitepaper",
          href: "https://docs.norchain.org/whitepaper",
          external: true,
        },
        {
          name: "Technical Docs",
          href: "https://docs.norchain.org/technical",
          external: true,
        },
        {
          name: "Explorer",
          href: "https://explorer.norchain.org",
          external: true,
        },
        {
          name: "Charity Reports",
          href: "https://explorer.norchain.org/charity",
          external: true,
        },
        { name: "Blog", href: "https://medium.com/@noor", external: true },
      ],
    },
    {
      title: "Community",
      links: [
        { name: "Discord", href: "https://discord.gg/norchain", external: true },
        { name: "Twitter", href: "https://twitter.com/norchain", external: true },
        { name: "Telegram", href: "https://t.me/norchain", external: true },
        { name: "GitHub", href: "https://github.com/norchain", external: true },
        { name: "Medium", href: "https://medium.com/@noor", external: true },
      ],
    },
  ];

  return (
    <footer className="bg-black border-t border-gray-800/50 relative overflow-hidden">
      {/* Background elements inspired by Dribbble designs */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-gradient-to-br from-cyan-500/5 via-blue-500/10 to-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-gradient-to-tl from-violet-500/5 via-purple-500/10 to-pink-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8 mb-16">
          {/* Modern brand section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl blur opacity-30" />
                <div className="relative h-12 w-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">N</span>
                </div>
              </div>
              <div>
                <span className="text-white text-2xl font-bold">NorChain</span>
              </div>
            </div>
            <p className="text-gray-400 mb-8 leading-relaxed text-base">
              Next-generation blockchain infrastructure engineered for speed, security, and scalability.
            </p>
            <div className="flex space-x-3">
              {[
                { icon: "🐦", url: "https://twitter.com/norchain", name: "Twitter" },
                { icon: "💬", url: "https://discord.gg/norchain", name: "Discord" },
                { icon: "💻", url: "https://github.com/norchain", name: "GitHub" },
                { icon: "✈️", url: "https://t.me/norchain", name: "Telegram" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="group relative h-12 w-12 bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl flex items-center justify-center hover:bg-gray-800/60 hover:border-gray-600/60 transition-all duration-300 text-xl shadow-lg hover:scale-110"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Enhanced footer sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider flex items-center">
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  {section.title}
                </span>
              </h4>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group text-gray-400 hover:text-cyan-300 transition-all duration-300 text-sm inline-flex items-center gap-2"
                      >
                        <span>{link.name}</span>
                        <svg
                          className="w-3 h-3 transition-transform group-hover:translate-x-1"
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
                    ) : link.scroll ? (
                      <a
                        href={link.href}
                        onClick={(e) => {
                          e.preventDefault();
                          document
                            .querySelector(link.href)
                            ?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="text-gray-400 hover:text-cyan-300 transition-colors duration-300 text-sm cursor-pointer"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-gray-400 hover:text-cyan-300 transition-colors duration-300 text-sm"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Modern bottom bar */}
        <div className="pt-8 mt-8 border-t border-gray-800/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-gray-400 text-sm text-center md:text-left">
              © {new Date().getFullYear()} NorChain Foundation. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-cyan-300 transition-colors duration-300"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-cyan-300 transition-colors duration-300"
              >
                Terms of Service
              </Link>
              <a
                href="mailto:contact@norchain.org"
                className="text-gray-400 hover:text-cyan-300 transition-colors duration-300"
              >
                Contact Us
              </a>
            </div>
          </div>
          
          {/* Enhanced network info */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-8 px-6 py-3 bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-lg">
              <div className="text-gray-400 text-xs">
                <span className="text-cyan-400 font-semibold">Chain ID:</span> 65001
              </div>
              <div className="text-gray-400 text-xs">
                <span className="text-cyan-400 font-semibold">RPC:</span> https://rpc.norchain.org
              </div>
              <div className="text-gray-400 text-xs">
                <span className="text-cyan-400 font-semibold">Symbol:</span> NOR
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
