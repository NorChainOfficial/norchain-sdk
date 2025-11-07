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
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-10 w-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">N</span>
              </div>
              <div>
                <span className="text-white text-2xl font-bold">NorChain</span>
                <span className="text-xs text-gray-400 ml-2">نور</span>
              </div>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Next-generation blockchain platform combining speed,
              affordability, and social impact.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: "🐦", url: "https://twitter.com/norchain" },
                { icon: "💬", url: "https://discord.gg/norchain" },
                { icon: "💻", url: "https://github.com/norchain" },
                { icon: "✈️", url: "https://t.me/norchain" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors text-xl"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors text-sm inline-flex items-center gap-1"
                      >
                        {link.name}
                        <svg
                          className="w-3 h-3"
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
                        className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-gray-400 hover:text-white transition-colors text-sm"
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

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Noor Foundation. All rights
              reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <a
                href="mailto:contact@norchain.org"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
          <div className="mt-6 text-center text-gray-500 text-xs">
            Chain ID: 65001 | RPC: https://rpc.norchain.org | Symbol: NOR
          </div>
        </div>
      </div>
    </footer>
  );
}
