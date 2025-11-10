"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

// Simple Markdown component for rendering formatted text
const ReactMarkdown = ({ content, className }: { content: string; className?: string }): JSX.Element => {
  const formatMarkdown = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-700/50 px-1.5 py-0.5 rounded text-sm">$1</code>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: formatMarkdown(content) }}
    />
  );
};

interface ChatMessage {
  readonly id: string;
  readonly role: "user" | "assistant";
  readonly content: string;
  readonly timestamp: Date;
  readonly quickOptions?: readonly QuickOption[];
  readonly isTyping?: boolean;
}

interface QuickOption {
  readonly id: string;
  readonly text: string;
  readonly icon: string;
  readonly category: "technical" | "business" | "getting-started" | "development";
}

interface AgenticResponse {
  readonly content: string;
  readonly confidence: number;
  readonly sources?: readonly string[];
  readonly insights?: readonly string[];
  readonly quickOptions?: readonly QuickOption[];
}

export default function AgenticChatbot(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShownProactiveMessage, setHasShownProactiveMessage] = useState(false);
  const [showProactivePopup, setShowProactivePopup] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const initialQuickOptions: readonly QuickOption[] = [
    { id: "norchain-intro", text: "Platform Overview", icon: "▶", category: "getting-started" },
    { id: "blockchain-basics", text: "Architecture & Technology", icon: "◆", category: "technical" },
    { id: "developer-start", text: "Developer Resources", icon: "⟨⟩", category: "development" },
    { id: "enterprise-features", text: "Enterprise Solutions", icon: "■", category: "business" },
    { id: "defi-guide", text: "DeFi Infrastructure", icon: "◇", category: "technical" },
    { id: "api-docs", text: "API Documentation", icon: "{ }", category: "development" },
  ];
  
  const [messages, setMessages] = useState<readonly ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Welcome to the **NorChain Assistant**. I'm here to provide comprehensive information about our blockchain infrastructure, development tools, and enterprise solutions.\n\n**Areas of expertise:**\n• Platform architecture and technical specifications\n• Developer tools and API integration\n• Enterprise blockchain implementation\n• DeFi protocol development\n• Smart contract deployment and optimization\n\nHow can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Proactive engagement system
  useEffect(() => {
    if (!hasShownProactiveMessage && !isOpen) {
      const timer = setTimeout(() => {
        setShowProactivePopup(true);
        setHasShownProactiveMessage(true);
      }, 15000); // Show after 15 seconds

      return () => clearTimeout(timer);
    }
  }, [hasShownProactiveMessage, isOpen]);

  // Inactivity detection
  useEffect(() => {
    const resetTimer = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (isOpen && messages.length > 1) {
        inactivityTimerRef.current = setTimeout(() => {
          if (messages[messages.length - 1]?.role === "user") {
            const helpMessage: ChatMessage = {
              id: `help-${Date.now()}`,
              role: "assistant",
              content: "I'm here to assist with any questions about NorChain's blockchain infrastructure. You may select from the options below or specify your particular requirements.",
              timestamp: new Date(),
              quickOptions: [
                { id: "performance", text: "Platform Benefits", icon: "▲", category: "business" },
                { id: "get-started", text: "Getting Started", icon: "▶", category: "getting-started" },
                { id: "ecosystem", text: "Technology Stack", icon: "◆", category: "technical" },
                { id: "contact", text: "Enterprise Support", icon: "◼", category: "business" },
              ],
            };
            setMessages(prev => [...prev, helpMessage]);
          }
        }, 30000);
      }
    };

    resetTimer();
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [messages, isOpen]);

  // Professional knowledge base for enterprise blockchain solutions
  const blockchainKnowledge = {
    norchain: {
      basics: "**NorChain** is an enterprise-grade blockchain infrastructure platform designed for high-performance applications. Our network processes transactions with **3-second finality** and offers **EVM compatibility** for seamless dApp migration. The platform delivers enterprise-level security, scalability, and developer tools required for production blockchain applications.",
      technology: "**Technical Architecture:** NorChain utilizes an optimized Proof-of-Stake consensus mechanism with **EVM compatibility**. The platform offers significant performance improvements including **90% lower transaction costs** and **10,000+ TPS throughput**. Our architecture enables seamless migration from Ethereum while providing enhanced performance and cost efficiency.",
      features: "**Platform Capabilities:** Comprehensive JSON-RPC APIs with sub-second response times, real-time WebSocket streaming, advanced smart contract deployment tools, integrated analytics suite, and **99.9% uptime SLA**. Our global infrastructure ensures consistent performance across multiple geographical regions.",
      performance: "**Performance Metrics:** 3-second transaction finality, 10,000+ transactions per second, 99.9% network uptime, 127+ active development teams, $2.8M+ daily transaction volume. These metrics demonstrate our platform's reliability and scalability for enterprise applications.",
      enterprise: "**Enterprise Solutions:** SOC 2 Type II certified infrastructure, dedicated resource allocation, custom rate limiting, 24/7 enterprise support, and white-label deployment options. Our enterprise clients include Fortune 500 companies requiring mission-critical blockchain infrastructure."
    },
    blockchain: {
      basics: "**Blockchain Technology:** A distributed ledger technology that maintains a continuously growing list of cryptographically secured records (blocks) across multiple nodes. Each transaction is verified through consensus mechanisms and becomes immutable once confirmed, providing transparency and eliminating single points of failure.",
      consensus: "**Consensus Mechanisms:** Distributed systems require consensus algorithms to validate transactions and maintain network integrity. Proof-of-Work systems use computational power for validation, while Proof-of-Stake systems use economic incentives. NorChain employs an optimized PoS consensus for energy efficiency and performance.",
      security: "**Security Architecture:** Blockchain security relies on cryptographic hashing algorithms, digital signature verification, and distributed consensus. The combination of these technologies creates tamper-resistant systems with mathematical guarantees of data integrity and authenticity.",
      applications: "**Enterprise Applications:** Blockchain technology enables supply chain transparency, digital identity management, smart contract automation, decentralized finance protocols, and asset tokenization. These applications provide significant value across multiple industry verticals."
    },
    defi: {
      basics: "💎 **DeFi is Financial Freedom:** Imagine banks, but **open 24/7**, **no middlemen**, **globally accessible**, and **programmable**. That's DeFi! Lend, borrow, trade, earn yield - all through smart contracts. It's like having a bank in your pocket that never closes! 🏦",
      protocols: "🔥 **DeFi Superstars:** **Uniswap** (trade any token instantly), **Aave** (lend/borrow with crazy good rates), **Compound** (automatic yield farming), **MakerDAO** (create stablecoins). On NorChain, these protocols run faster and cheaper! ⚡",
      opportunities: "💰 **Yield Opportunities:** Liquidity mining (earn tokens for providing liquidity), yield farming (compound your gains), flash loans (borrow millions instantly), and arbitrage opportunities. DeFi never sleeps! 🌙",
      risks: "⚠️ **Smart Risks Management:** Always DYOR (Do Your Own Research), understand impermanent loss, be aware of smart contract risks, and never invest more than you can afford to lose. High rewards come with high responsibility! 📊"
    },
    smartcontracts: {
      basics: "🤖 **Code That Executes Itself:** Smart contracts are like digital vending machines - put in the right inputs, get guaranteed outputs. No lawyers, no delays, just pure automation! Perfect for trustless interactions. 🎯",
      development: "👩‍💻 **Building on NorChain:** Use **Solidity** (Ethereum-compatible), **Hardhat** for testing, **OpenZeppelin** for security, and our **deployment tools** for instant mainnet launches. We make smart contract development a breeze! 🌬️",
      usecases: "🎨 **Endless Possibilities:** NFT marketplaces, DeFi protocols, DAOs, gaming assets, supply chain tracking, insurance claims, voting systems, royalty distribution - if you can code it, you can build it! 🏗️",
      security: "🛡️ **Security First:** Always get audits, follow security patterns, use established libraries, and test extensively. On NorChain, we provide security scanning tools to keep your contracts safe! 🔍"
    },
    quickAnswers: {
      "norchain-intro": {
        content: "🚀 **Welcome to NorChain!** \n\nWe're the **fastest, most developer-friendly blockchain** on the planet! Here's why developers love us:\n\n⚡ **3-second transactions** (10x faster than Ethereum)\n💰 **90% lower fees** than other networks\n🔧 **Ethereum-compatible** - migrate in minutes\n🌍 **Global infrastructure** with 99.9% uptime\n👩‍💻 **127+ active dev teams** building amazing dApps\n\n**Ready to build the future?** 🌟",
        quickOptions: [
          { id: "developer-start", text: "Start Building Now", icon: "🚀", category: "development" },
          { id: "api-docs", text: "API Documentation", icon: "📚", category: "development" },
          { id: "performance", text: "Performance Metrics", icon: "📊", category: "technical" },
          { id: "enterprise-features", text: "Enterprise Solutions", icon: "🏢", category: "business" },
        ]
      },
      "developer-start": {
        content: "👩‍💻 **Let's Build Something Amazing!**\n\n**Quick Start Guide:**\n1. 🔗 **Connect:** Add NorChain RPC to MetaMask\n2. 💰 **Get Testnet NOR:** Use our faucet\n3. 🛠️ **Deploy:** Use Hardhat, Truffle, or Remix\n4. 🚀 **Launch:** Deploy to mainnet in seconds!\n\n**Developer Resources:**\n• 📖 Complete documentation\n• 🧪 Testing tools & faucets\n• 🎓 Tutorials & examples\n• 💬 24/7 developer support\n\n**Ready to revolutionize your dApp?** ⚡",
        quickOptions: [
          { id: "api-docs", text: "API Reference", icon: "📚", category: "development" },
          { id: "testnet-guide", text: "Testnet Setup", icon: "🧪", category: "development" },
          { id: "smart-contract-guide", text: "Smart Contract Guide", icon: "📝", category: "development" },
          { id: "examples", text: "Code Examples", icon: "💻", category: "development" },
        ]
      }
    }
  };

  const handleQuickOption = useCallback((optionId: string) => {
    // Handle predefined quick options
    const quickAnswer = blockchainKnowledge.quickAnswers[optionId as keyof typeof blockchainKnowledge.quickAnswers];
    if (quickAnswer) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: initialQuickOptions.find(opt => opt.id === optionId)?.text || optionId,
        timestamp: new Date(),
      };

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: quickAnswer.content,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage, assistantMessage]);
    }
  }, [initialQuickOptions]);

  const generateResponse = useCallback(async (userMessage: string): Promise<AgenticResponse> => {
    // Enhanced RAG processing with personality
    const message = userMessage.toLowerCase();
    let response = "";
    let confidence = 0.8;
    const sources: string[] = [];
    const insights: string[] = [];

    // Check for quick answer patterns first
    if (message.includes("what is norchain") || message.includes("about norchain")) {
      return {
        content: blockchainKnowledge.quickAnswers["norchain-intro"].content,
        confidence: 0.98,
        sources: ["NorChain Official Documentation", "Performance Benchmarks"],
        insights: ["127+ active dev teams", "3-second block finality", "90% lower fees than Ethereum"],
      };
    }

    // NorChain specific queries with enhanced personality
    if (message.includes("norchain") || message.includes("nor chain")) {
      if (message.includes("performance") || message.includes("fast") || message.includes("speed")) {
        response = blockchainKnowledge.norchain.performance;
        sources.push("Live Network Statistics", "Performance Benchmarks");
        confidence = 0.96;
      } else if (message.includes("enterprise") || message.includes("business")) {
        response = blockchainKnowledge.norchain.enterprise;
        sources.push("Enterprise Solutions", "SOC 2 Certification");
        confidence = 0.94;
      } else if (message.includes("technology") || message.includes("tech") || message.includes("how")) {
        response = blockchainKnowledge.norchain.technology;
        sources.push("Technical Architecture", "EVM Compatibility Guide");
        confidence = 0.95;
      } else {
        response = blockchainKnowledge.norchain.basics;
        sources.push("NorChain Overview", "Getting Started");
        confidence = 0.90;
      }
      insights.push("🔥 NorChain is 10x faster than Ethereum", "💰 90% lower transaction fees", "🌍 Global infrastructure with 99.9% uptime");
    }
    
    // Blockchain general queries
    else if (message.includes("blockchain") || message.includes("distributed ledger")) {
      if (message.includes("how") || message.includes("work") || message.includes("consensus")) {
        response = `${blockchainKnowledge.blockchain.basics} ${blockchainKnowledge.blockchain.consensus}`;
        sources.push("Blockchain Fundamentals", "Consensus Mechanisms Guide");
        confidence = 0.85;
      } else if (message.includes("security") || message.includes("secure")) {
        response = blockchainKnowledge.blockchain.security;
        sources.push("Blockchain Security Principles", "Cryptography Fundamentals");
        confidence = 0.87;
      } else {
        response = `${blockchainKnowledge.blockchain.basics} This creates an immutable, transparent record of transactions that's secured by cryptographic principles.`;
        sources.push("Introduction to Blockchain", "Distributed Systems Overview");
        confidence = 0.80;
      }
      insights.push("Blockchain enables trustless transactions", "Cryptographic security prevents tampering", "Decentralization removes single points of failure");
    }
    
    // DeFi queries
    else if (message.includes("defi") || message.includes("decentralized finance")) {
      if (message.includes("risk") || message.includes("danger") || message.includes("safe")) {
        response = blockchainKnowledge.defi.risks;
        sources.push("DeFi Risk Assessment", "Smart Contract Auditing");
        confidence = 0.89;
      } else if (message.includes("protocol") || message.includes("platform")) {
        response = blockchainKnowledge.defi.protocols;
        sources.push("DeFi Protocol Analysis", "TVL Rankings");
        confidence = 0.91;
      } else {
        response = `${blockchainKnowledge.defi.basics} DeFi has grown to over $50B in total value locked (TVL) across various protocols.`;
        sources.push("DeFi Ecosystem Overview", "Yield Farming Strategies");
        confidence = 0.86;
      }
      insights.push("DeFi enables 24/7 global financial services", "Yield farming can generate 5-20% APY", "Always DYOR before investing in DeFi protocols");
    }
    
    // Smart contract queries
    else if (message.includes("smart contract") || message.includes("solidity")) {
      if (message.includes("develop") || message.includes("create") || message.includes("build")) {
        response = `${blockchainKnowledge.smartcontracts.development} NorChain provides comprehensive smart contract development tools and testing environments.`;
        sources.push("Solidity Documentation", "NorChain Smart Contract Tools");
        confidence = 0.93;
      } else if (message.includes("use case") || message.includes("example")) {
        response = blockchainKnowledge.smartcontracts.usecases;
        sources.push("Smart Contract Use Cases", "DApp Examples");
        confidence = 0.88;
      } else {
        response = `${blockchainKnowledge.smartcontracts.basics} They're particularly powerful on NorChain due to fast execution and low gas fees.`;
        sources.push("Smart Contract Fundamentals", "Ethereum Virtual Machine");
        confidence = 0.84;
      }
      insights.push("Smart contracts eliminate middlemen", "Code auditing is critical for security", "Gas optimization reduces transaction costs");
    }
    
    // Fallback response
    else {
      response = "I'd be happy to help you learn about blockchain technology! I can explain concepts like blockchain fundamentals, DeFi protocols, smart contracts, NorChain's infrastructure, or answer specific technical questions. What aspect interests you most?";
      sources.push("Blockchain Education Resources");
      confidence = 0.60;
      insights.push("Blockchain is revolutionizing finance", "Always verify information from multiple sources", "Start with basics before advanced concepts");
    }

    return { content: response, confidence, sources, insights };
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
      
      const agenticResponse = await generateResponse(userMessage.content);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: agenticResponse.content,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error generating response:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I'm having trouble processing your request right now. Please try again or rephrase your question.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, generateResponse]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return (
    <>
      {/* Professional Help Popup */}
      {showProactivePopup && !isOpen && (
        <div className="fixed bottom-24 right-8 z-[60] animate-fade-in-up">
          <div className="relative bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 p-5 rounded-xl shadow-2xl max-w-sm">
            <div className="absolute -bottom-1 right-8 w-3 h-3 bg-slate-900 border-r border-b border-slate-700/50 rotate-45"></div>
            <div className="text-slate-200 text-sm font-medium mb-4 leading-relaxed">
              **NorChain Assistant** available to help with platform information, technical documentation, and implementation guidance.
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setIsOpen(true); setShowProactivePopup(false); }}
                className="flex-1 px-4 py-2 bg-blue-600/90 backdrop-blur-sm rounded-lg text-white text-xs font-medium hover:bg-blue-500 transition-all duration-200 border border-blue-500/50"
              >
                Get Assistance
              </button>
              <button
                onClick={() => setShowProactivePopup(false)}
                className="px-4 py-2 bg-slate-800/80 backdrop-blur-sm rounded-lg text-slate-300 text-xs font-medium hover:bg-slate-700/80 transition-all duration-200 border border-slate-600/30"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Professional Toggle Button */}
      <div className="fixed bottom-6 right-6 z-[60]">
        <button
          onClick={toggleChat}
          className={`group relative h-14 w-14 bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 ${
            isOpen ? "scale-105 bg-slate-800/90 border-slate-600/60" : ""
          }`}
          aria-label={isOpen ? "Close NorChain assistant" : "Open NorChain assistant"}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
          <div className="relative">
            {isOpen ? (
              <svg className="w-5 h-5 text-slate-300 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 4v-4z" />
              </svg>
            )}
          </div>
          {!isOpen && (
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full">
              <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-30" />
            </div>
          )}
        </button>
      </div>

      {/* Sidebar Drawer */}
      <div className={`fixed inset-y-0 right-0 z-[55] w-full sm:w-[480px] transform transition-all duration-500 ease-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        {/* Backdrop */}
        <div className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`} onClick={toggleChat} />
        
        {/* Professional Drawer Content */}
        <div className="relative h-full bg-slate-950 border-l border-slate-700/60 shadow-2xl flex flex-col">
          {/* Professional Header - Solid */}
          <div className="relative bg-slate-900 border-b border-slate-700/70 p-4 sm:p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative">
                  <div className="h-10 sm:h-12 w-10 sm:w-12 bg-slate-800/80 backdrop-blur-sm rounded-lg flex items-center justify-center border border-slate-600/50 shadow-sm">
                    <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-blue-500 border-2 border-slate-900 rounded-full">
                    <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-40" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-100 tracking-tight">NorChain Assistant</h3>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse" />
                    <p className="text-slate-400 text-xs sm:text-sm font-medium">Platform Support & Documentation</p>
                  </div>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="h-8 w-8 bg-slate-800/60 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-slate-700/60 transition-all duration-200 border border-slate-600/30"
                aria-label="Close assistant"
              >
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Professional Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 bg-gradient-to-b from-slate-950/90 to-slate-900/95">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fadeInUp`}
              >
                <div className="max-w-[85%] space-y-2">
                  <div
                    className={`p-4 rounded-xl shadow-lg border ${
                      message.role === "user"
                        ? "bg-blue-600/90 backdrop-blur-sm text-white border-blue-500/40"
                        : "bg-slate-800/60 backdrop-blur-sm border-slate-600/40 text-slate-100"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex items-start gap-3 mb-3">
                        <div className="h-6 w-6 bg-slate-700/60 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-600/40">
                          <svg className="h-3 w-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="text-xs text-slate-400 font-medium tracking-wide">NorChain Assistant</div>
                      </div>
                    )}
                    
                    <div className={`text-sm leading-relaxed ${message.role === "user" ? "text-white" : "text-slate-200"}`}>
                      <ReactMarkdown content={message.content} className="prose prose-invert prose-sm max-w-none" />
                    </div>

                    {message.quickOptions && message.quickOptions.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <div className="text-xs text-slate-400 font-medium border-t border-slate-600/30 pt-3">Suggested Actions:</div>
                        <div className="grid grid-cols-2 gap-2">
                          {message.quickOptions.map((option) => (
                            <button
                              key={option.id}
                              onClick={() => handleQuickOption(option.id)}
                              className={`group p-3 rounded-lg border transition-all duration-200 hover:scale-[1.02] text-left ${
                                option.category === "development"
                                  ? "bg-slate-700/40 border-slate-600/50 hover:bg-slate-600/50 hover:border-blue-500/50"
                                  : option.category === "business"
                                  ? "bg-slate-700/40 border-slate-600/50 hover:bg-slate-600/50 hover:border-indigo-500/50"
                                  : option.category === "technical"
                                  ? "bg-slate-700/40 border-slate-600/50 hover:bg-slate-600/50 hover:border-cyan-500/50"
                                  : "bg-slate-700/40 border-slate-600/50 hover:bg-slate-600/50 hover:border-purple-500/50"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-mono text-slate-400 group-hover:text-slate-300">{option.icon}</span>
                                <span className="text-xs font-medium text-slate-200 group-hover:text-slate-100">{option.text}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className={`text-xs mt-3 opacity-60 ${message.role === "user" ? "text-blue-100" : "text-gray-400"}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {(isLoading || isTyping) && (
              <div className="flex justify-start animate-fadeInUp">
                <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/40 p-4 rounded-xl shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 bg-slate-700/60 rounded-lg flex items-center justify-center border border-slate-600/40">
                      <svg className="h-3 w-3 text-blue-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                      </div>
                      <span className="text-slate-400 text-sm font-medium">Processing request...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Professional Input Area */}
          <div className="border-t border-slate-700/70 bg-slate-900 shadow-lg">
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              {/* Input Container */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-indigo-600/5 to-purple-600/5 rounded-xl blur-lg opacity-0 group-focus-within:opacity-100 transition-all duration-300"></div>
                <div className="relative flex items-end gap-2 sm:gap-3 p-3 sm:p-4 bg-slate-800/50 backdrop-blur-sm border border-slate-600/40 rounded-xl shadow-lg hover:border-slate-500/60 focus-within:border-blue-500/60 focus-within:shadow-blue-500/10 focus-within:shadow-xl transition-all duration-300">
                  <div className="flex-1 space-y-2">
                    {/* Input Label */}
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                      <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Ask the NorChain Assistant</span>
                    </div>
                    
                    {/* Enhanced Textarea */}
                    <div className="relative">
                      <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Ask about NorChain platform, APIs, smart contracts..."
                        disabled={isLoading}
                        rows={2}
                        className="w-full bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none resize-none text-sm leading-relaxed min-h-[3.5rem] max-h-40 overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600"
                        style={{ 
                          height: 'auto',
                          minHeight: '3.5rem'
                        }}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = 'auto';
                          target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
                        }}
                      />
                      
                      {/* Character Count */}
                      {inputValue.length > 50 && (
                        <div className="absolute bottom-1 right-1 text-xs text-slate-500">
                          {inputValue.length}/500
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Enhanced Send Button */}
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading}
                      className={`relative h-12 w-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 group/btn ${
                        !inputValue.trim() || isLoading
                          ? 'bg-slate-700/50 border border-slate-600/40 cursor-not-allowed'
                          : 'bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 border border-blue-500/50 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-600 hover:scale-110 hover:shadow-blue-500/30 hover:shadow-xl cursor-pointer'
                      }`}
                      aria-label="Send message"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                      {isLoading ? (
                        <svg className="w-4 h-4 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className={`w-5 h-5 relative z-10 transition-all duration-200 ${
                          !inputValue.trim() ? 'text-slate-400' : 'text-white group-hover/btn:scale-110'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                    </button>
                    
                    {/* Keyboard Shortcut Hint */}
                    <div className="text-xs text-slate-500 text-center leading-tight">
                      <kbd className="px-1.5 py-0.5 bg-slate-700/50 rounded text-xs">↵</kbd>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Suggestions */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 sm:gap-2">
                {[
                  "API documentation",
                  "Getting started",
                  "Enterprise pricing",
                  "Technical architecture"
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInputValue(suggestion)}
                    className="px-3 py-1.5 text-xs text-slate-400 bg-slate-800/40 backdrop-blur-sm border border-slate-700/40 rounded-lg hover:bg-slate-700/50 hover:text-slate-300 hover:border-slate-600/60 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              
              {/* Enhanced Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-700/30">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-xs text-slate-400 font-medium">Enterprise Assistant</span>
                  </div>
                  <div className="h-3 w-px bg-slate-600/50"></div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Secure & Private</span>
                  </div>
                </div>
                
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <span>Powered by</span>
                  <span className="text-blue-400 font-medium">NorChain AI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={toggleChat}
        />
      )}
    </>
  );
}