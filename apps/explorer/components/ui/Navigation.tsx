"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Navigation = (): JSX.Element => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/analytics", label: "Analytics", icon: "📊" },
    { href: "/transactions", label: "Transactions", icon: "💸" },
    { href: "/validators", label: "Validators", icon: "✓" },
    { href: "/contracts", label: "Contracts", icon: "📝" },
    { href: "/flashcoins", label: "Flash Coins", icon: "⚡" },
    { href: "/wallet-setup", label: "Wallet Setup", icon: "💼" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg sticky top-0 z-50 backdrop-blur-lg bg-opacity-95 dark:bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Brand */}
          <Link
            href="/"
            className="flex items-center gap-3 group transition-all duration-300 hover:scale-105"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-yellow-400 dark:to-green-400 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition-opacity animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 dark:from-yellow-400 dark:to-green-400 rounded-xl p-3 shadow-xl">
                <span className="text-2xl font-bold text-white dark:text-gray-900">
                  ₿
                </span>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-yellow-400 dark:to-green-400 bg-clip-text text-transparent">
                NorChain
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                Block Explorer & Verifier
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 group overflow-hidden ${
                  isActive(item.href)
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 dark:from-yellow-400 dark:to-green-400 text-white dark:text-gray-900 shadow-xl scale-105"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white hover:shadow-lg hover:scale-105"
                }`}
              >
                {!isActive(item.href) && (
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-yellow-400/10 dark:to-green-400/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                )}
                <span className="relative flex items-center gap-2">
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </span>
                {isActive(item.href) && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 bg-white dark:bg-gray-900 rounded-t-full"></span>
                )}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800 animate-fadeIn">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                    isActive(item.href)
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 dark:from-yellow-400 dark:to-green-400 text-white dark:text-gray-900 shadow-lg"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
