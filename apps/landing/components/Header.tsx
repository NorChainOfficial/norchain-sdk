"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#features", scroll: true },
    { name: "APIs", href: "#ecosystem", scroll: true },
    { name: "Enterprise", href: "#enterprise", scroll: true },
    { name: "Stats", href: "#network-stats", scroll: true },
    { name: "Tech", href: "#technology", scroll: true },
    { name: "Community", href: "#community", scroll: true },
    { name: "Docs", href: "https://docs.norchain.org", external: true },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-[#0f2847]/90 backdrop-blur-xl border-b border-cyan-500/20'
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* NorChain Logo */}
          <Link href="/" className="flex items-center space-x-4 group">
            <div className="relative h-20 w-20 transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/favicon.png"
                alt="NorChain Icon"
                width={80}
                height={80}
                priority
                className="h-20 w-20 rounded-full shadow-glow group-hover:shadow-glow-intense"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-white text-3xl font-display font-bold tracking-wide">
                NorChain
              </span>
              <span className="text-white text-sm font-body font-semibold tracking-wide">
                The Complete Blockchain OS
              </span>
            </div>
          </Link>

          {/* Ultra-clean desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) =>
              link.external ? (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white transition-colors font-light text-sm tracking-wide hover:underline underline-offset-4"
                >
                  {link.name}
                </a>
              ) : link.scroll ? (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-slate-300 hover:text-white transition-colors font-light text-sm tracking-wide cursor-pointer hover:underline underline-offset-4"
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.querySelector(link.href);
                    if (element) {
                      // Add spring scroll animation
                      const startPosition = window.pageYOffset;
                      const targetPosition = element.getBoundingClientRect().top + startPosition - 32; // 2rem offset
                      const distance = targetPosition - startPosition;
                      const duration = Math.min(Math.abs(distance) / 2, 1200); // Dynamic duration, max 1200ms
                      
                      let start: number | null = null;
                      
                      function animation(currentTime: number) {
                        if (start === null) start = currentTime;
                        const timeElapsed = currentTime - start;
                        const progress = Math.min(timeElapsed / duration, 1);
                        
                        // Cubic bezier spring easing
                        const easeOutBounce = (t: number): number => {
                          if (t < 1 / 2.75) return 7.5625 * t * t;
                          else if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
                          else if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
                          else return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
                        };
                        
                        const easedProgress = easeOutBounce(progress);
                        window.scrollTo(0, startPosition + distance * easedProgress);
                        
                        if (progress < 1) requestAnimationFrame(animation);
                      }
                      
                      requestAnimationFrame(animation);
                    }
                  }}
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-slate-300 hover:text-white transition-colors font-light text-sm tracking-wide hover:underline underline-offset-4"
                >
                  {link.name}
                </Link>
              )
            )}
            
            {/* Minimal CTA button */}
            <div className="flex items-center space-x-4">
              <a
                href="https://explorer.norchain.org"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-light rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-105"
              >
                Explorer
              </a>
            </div>
          </div>

          {/* Modern mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-white hover:text-cyan-400 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Modern mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-6 pb-6 space-y-4 border-t border-cyan-500/20 pt-6 bg-[#0f2847]/95 backdrop-blur-xl rounded-2xl mx-4 px-6">
            {navLinks.map((link) =>
              link.external ? (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-slate-300 hover:text-white transition-colors font-light text-lg py-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </a>
              ) : link.scroll ? (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-slate-300 hover:text-white transition-colors font-light text-lg py-3 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMenuOpen(false);
                    const element = document.querySelector(link.href);
                    if (element) {
                      // Add spring scroll animation for mobile
                      const startPosition = window.pageYOffset;
                      const targetPosition = element.getBoundingClientRect().top + startPosition - 32;
                      const distance = targetPosition - startPosition;
                      const duration = Math.min(Math.abs(distance) / 2, 1200);
                      
                      let start: number | null = null;
                      
                      function animation(currentTime: number) {
                        if (start === null) start = currentTime;
                        const timeElapsed = currentTime - start;
                        const progress = Math.min(timeElapsed / duration, 1);
                        
                        const easeOutBounce = (t: number): number => {
                          if (t < 1 / 2.75) return 7.5625 * t * t;
                          else if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
                          else if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
                          else return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
                        };
                        
                        const easedProgress = easeOutBounce(progress);
                        window.scrollTo(0, startPosition + distance * easedProgress);
                        
                        if (progress < 1) requestAnimationFrame(animation);
                      }
                      
                      requestAnimationFrame(animation);
                    }
                  }}
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block text-slate-300 hover:text-white transition-colors font-light text-lg py-3"
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
              className="block w-full text-center px-6 py-3 mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-light transition-all"
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
