"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Features", href: "#features", scroll: true },
    { name: "DEX", href: "/dex" },
    { name: "Bridge", href: "/bridge" },
    { name: "Charity", href: "#charity", scroll: true },
    { name: "Roadmap", href: "#roadmap", scroll: true },
    { name: "Docs", href: "https://docs.norchain.org", external: true },
  ];

  return (
    <nav className="fixed w-full bg-white/95 backdrop-blur-lg border-b border-gray-200 z-50 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="h-10 w-10 bg-gradient-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 shadow-lg">
              <span className="text-white font-bold text-2xl">N</span>
            </div>
            <div>
              <span className="text-gray-900 dark:text-white text-2xl font-bold">NorChain</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 font-medium">نور</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) =>
              link.external ? (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  {link.name}
                </a>
              ) : link.scroll ? (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.querySelector(link.href);
                    element?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  {link.name}
                </Link>
              )
            )}
            <a
              href="https://explorer.norchain.org"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-all shadow-lg hover:shadow-xl font-semibold"
            >
              Launch Explorer
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3 border-t border-gray-200 pt-4 animate-slideDown">
            {navLinks.map((link) =>
              link.external ? (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </a>
              ) : link.scroll ? (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-gray-700 hover:text-blue-600 transition-colors font-medium py-2 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMenuOpen(false);
                    const element = document.querySelector(link.href);
                    element?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              )
            )}
            <a
              href="https://explorer.norchain.org"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-6 py-3 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-all shadow-lg text-center font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              Launch Explorer
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
