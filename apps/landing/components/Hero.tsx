"use client";

import { useEffect, useState } from "react";

export default function Hero() {
  const [blockHeight, setBlockHeight] = useState(7542);
  const [charityTotal, setCharityTotal] = useState(164000);

  useEffect(() => {
    const updateNetworkStats = async () => {
      try {
        const response = await fetch("https://rpc.norchain.org", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_blockNumber",
            params: [],
            id: 1,
          }),
        });
        const data = await response.json();
        const height = parseInt(data.result, 16);
        setBlockHeight(height);
        setCharityTotal(Math.floor(height * 0.02 * 365));
      } catch (error) {
        console.error("Error fetching network stats:", error);
      }
    };

    updateNetworkStats();
    const interval = setInterval(updateNetworkStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const addToMetaMask = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        await (window as any).ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0xFDE9", // 65001 in hex
              chainName: "NorChain",
              nativeCurrency: {
                name: "Noor Token",
                symbol: "NOR",
                decimals: 18,
              },
              rpcUrls: ["https://rpc.norchain.org"],
              blockExplorerUrls: ["https://explorer.norchain.org"],
            },
          ],
        });

        alert("✅ Success! NorChain added to MetaMask");
      } catch (error: any) {
        if (error.code === 4001) {
          alert("❌ User rejected the request");
        } else {
          alert("❌ Error adding Noor to MetaMask");
        }
      }
    } else {
      alert("Please install MetaMask!");
      window.open("https://metamask.io/download/", "_blank");
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="text-center">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="h-24 w-24 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-2xl hover:scale-105 transition-transform">
              <span className="text-white font-bold text-5xl">N</span>
            </div>
          </div>

          {/* Main Tagline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
            NorChain
            <br />
            <span className="text-green-300">نور - Light</span>
          </h1>

          {/* Islamic Finance Badge */}
          <div className="inline-flex items-center gap-3 bg-emerald-500/20 backdrop-blur-md border-2 border-emerald-400 px-6 py-3 rounded-full mb-6">
            <span className="text-3xl">☪️</span>
            <span className="text-lg font-bold text-emerald-100">
              World's First Shariah-Compliant Blockchain
            </span>
          </div>

          {/* Key Islamic Features */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-lg">
              <span className="text-emerald-300 font-bold">✓ No Riba (Interest-Free)</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-lg">
              <span className="text-emerald-300 font-bold">✓ No Gharar (Transparent)</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-lg">
              <span className="text-emerald-300 font-bold">✓ Halal Trading Only</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-lg">
              <span className="text-emerald-300 font-bold">✓ Auto Zakat (2.5%)</span>
            </div>
          </div>

          {/* Mission */}
          <div className="mb-6 bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-4xl mx-auto border border-white/20">
            <h2 className="text-sm uppercase tracking-wide text-blue-200 mb-2">
              Our Mission
            </h2>
            <p className="text-xl md:text-2xl text-white font-medium">
              Enable ethical, transparent, and intelligent Islamic financial systems
              across emerging economies—bridging fiat, gold, digital assets, and
              AI-driven governance under Shariah principles.
            </p>
          </div>

          {/* Vision */}
          <p className="text-lg md:text-xl mb-8 text-blue-100 max-w-4xl mx-auto leading-relaxed">
            A world where 1.8 billion Muslims can transact, invest, and build wealth
            in a transparent halal-compliant environment—no riba, no gharar, just
            ethical blockchain finance.
          </p>

          {/* Live Stats Bar */}
          <div className="flex flex-wrap justify-center gap-8 mb-10">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold">
                {blockHeight.toLocaleString()}+
              </div>
              <div className="text-blue-200 text-sm md:text-base">Blocks</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold">3s</div>
              <div className="text-blue-200 text-sm md:text-base">
                Block Time
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold">&lt;$0.001</div>
              <div className="text-blue-200 text-sm md:text-base">Gas Fees</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-green-300">
                ${(charityTotal / 1000).toFixed(0)}k
              </div>
              <div className="text-blue-200 text-sm md:text-base">
                Charity/Year
              </div>
            </div>
          </div>

          {/* Primary CTA: Add to MetaMask */}
          <button
            onClick={addToMetaMask}
            className="bg-white text-blue-700 px-10 py-4 rounded-lg text-xl font-bold hover:bg-blue-50 transition-all shadow-2xl hover:scale-105 inline-flex items-center gap-3 mb-6 animate-fade-in"
          >
            <svg className="h-8 w-8" viewBox="0 0 40 40" fill="none">
              <path
                d="M37.6 4L22.7 15.3l2.8-6.6z"
                fill="#E17726"
                stroke="#E17726"
                strokeWidth="0.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2.4 4l14.7 11.4-2.7-6.7L2.4 4zM32.3 28.8l-4 6.1 8.6 2.4 2.5-8.3-7.1-.2zM.6 29l2.4 8.3 8.6-2.4-4-6.1-7 .2z"
                fill="#E27625"
                stroke="#E27625"
                strokeWidth="0.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11.1 17.5l-2.4 3.6 8.5.4-.3-9.1-5.8 5.1zM28.9 17.5l-5.9-5.2-.2 9.2 8.5-.4-2.4-3.6zM11.6 34.9l5.1-2.5-4.4-3.4-.7 5.9zM23.3 32.4l5.1 2.5-.7-5.9-4.4 3.4z"
                fill="#E27625"
                stroke="#E27625"
                strokeWidth="0.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M28.4 34.9l-5.1-2.5.4 3.2v1.4l4.7-2.1zM11.6 34.9l4.7 2.1v-1.4l.4-3.2-5.1 2.5z"
                fill="#D5BFB2"
                stroke="#D5BFB2"
                strokeWidth="0.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16.4 26.3l-4.3-1.3 3-1.4 1.3 2.7zM23.6 26.3l1.3-2.7 3 1.4-4.3 1.3z"
                fill="#233447"
                stroke="#233447"
                strokeWidth="0.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11.6 34.9l.7-6.1-4.7.2 4 5.9zM27.7 28.8l.7 6.1 4-5.9-4.7-.2zM31.3 21.1l-8.5.4.8 4.8 1.3-2.7 3 1.4 3.4-4zM12.1 25l3-1.4 1.3 2.7.8-4.8-8.5-.4 3.4 3.9z"
                fill="#CC6228"
                stroke="#CC6228"
                strokeWidth="0.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8.7 21.1l3.5 6.8-.1-3.9-3.4-2.9zM27.9 23.1l-.1 3.9 3.5-6.8-3.4 2.9zM17.2 21.5l-.8 4.8.9 4.9.2-6.6-.3-3.1zM22.8 21.5l-.3 3 .2 6.6.9-4.9-.8-4.7z"
                fill="#E27525"
                stroke="#E27525"
                strokeWidth="0.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M23.6 26.3l-.9 4.9.7.5 4.4-3.4.1-3.9-4.3 1.9zM12.1 25l.1 3.9 4.4 3.4.7-.5-.9-4.9-4.3-1.9z"
                fill="#F5841F"
                stroke="#F5841F"
                strokeWidth="0.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M23.7 37l-.4-3.2-.3.3h-5.8l-.3-.3-.4 3.2-.4.2 1.7 1.3 1.3.9h3.6l1.3-.9 1.7-1.3-.4-.2z"
                fill="#C0AC9D"
                stroke="#C0AC9D"
                strokeWidth="0.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M23.3 32.4l-.7-.5h-5.2l-.7.5-.4 3.2.3-.3h5.8l.3.3-.4-3.2z"
                fill="#161616"
                stroke="#161616"
                strokeWidth="0.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M38.2 12.7l1.3-6.3L37.6 4l-14.3 10.6 5.5 4.7 7.8 2.3 1.7-2-.8-.6 1.2-1.1-.9-.7 1.2-.9-.8-.6zM.5 6.4l1.3 6.3-.8.6 1.2.9-.9.7 1.2 1.1-.8.6 1.7 2 7.8-2.3 5.5-4.7L2.4 4 .5 6.4z"
                fill="#763E1A"
                stroke="#763E1A"
                strokeWidth="0.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M36.6 19.9l-7.8-2.3 2.4 3.6-3.5 6.8 4.6-.1h6.9l-2.6-8zM11.1 17.5l-7.8 2.3-2.6 8h6.9l4.6.1-3.5-6.8 2.4-3.6zM22.8 21.5l.5-8.6 2.3-6.2h-10.2l2.3 6.2.5 8.6.2 3.1v6.6h5.2v-6.6l.2-3.1z"
                fill="#F5841F"
                stroke="#F5841F"
                strokeWidth="0.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Add Noor to MetaMask
          </button>

          {/* Secondary CTAs */}
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#features"
              className="px-6 py-3 bg-blue-800/50 backdrop-blur-sm text-white rounded-lg hover:bg-blue-700/50 transition-all border border-blue-400/30 hover:scale-105"
              onClick={(e) => {
                e.preventDefault();
                document
                  .querySelector("#features")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Learn More
            </a>
            <a
              href="https://explorer.norchain.org"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-800/50 backdrop-blur-sm text-white rounded-lg hover:bg-blue-700/50 transition-all border border-blue-400/30 hover:scale-105 inline-flex items-center gap-2"
            >
              Block Explorer
              <svg
                className="w-4 h-4"
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
            <a
              href="https://github.com/norchain/norchain-sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-800/50 backdrop-blur-sm text-white rounded-lg hover:bg-blue-700/50 transition-all border border-blue-400/30 hover:scale-105 inline-flex items-center gap-2"
            >
              GitHub
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  );
}
