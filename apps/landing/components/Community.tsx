"use client";

import { useState } from "react";

export default function Community() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // In a real app, this would call an API
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail("");
      }, 3000);
    }
  };

  const socialLinks = [
    {
      name: "Discord",
      icon: "💬",
      url: "https://discord.gg/noorchain",
      members: "5,000+",
      description: "Join our community discussions",
    },
    {
      name: "Twitter",
      icon: "🐦",
      url: "https://twitter.com/noorchain",
      members: "12,000+",
      description: "Latest updates and announcements",
    },
    {
      name: "Telegram",
      icon: "✈️",
      url: "https://t.me/noorchain",
      members: "8,000+",
      description: "Real-time chat with the team",
    },
    {
      name: "GitHub",
      icon: "💻",
      url: "https://github.com/noorchain",
      members: "500+ stars",
      description: "Open source contributions",
    },
    {
      name: "Medium",
      icon: "📝",
      url: "https://medium.com/@noor",
      members: "3,000+",
      description: "Technical articles and updates",
    },
    {
      name: "YouTube",
      icon: "📺",
      url: "https://youtube.com/@noorchain",
      members: "2,000+",
      description: "Tutorials and demos",
    },
  ];

  return (
    <section id="community" className="py-32 bg-gradient-to-b from-black via-gray-950 to-black scroll-mt-8 relative overflow-hidden">
      {/* Background elements inspired by Dribbble designs */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-[600px] h-[600px] bg-gradient-to-br from-purple-500/10 via-blue-500/15 to-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-gradient-to-tl from-blue-500/10 via-purple-500/15 to-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Bold Dribbble-inspired section header */}
        <div className="text-center mb-24">
          <div className="relative inline-block mb-8">
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white">
              Community
            </h2>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1.5 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-full" />
          </div>
          <p className="text-2xl text-gray-400 font-light max-w-4xl mx-auto leading-relaxed">
            Connect with developers, validators, and blockchain enthusiasts worldwide
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-24">
          {socialLinks.map((social, index) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative"
            >
              {/* Modern glassmorphism card */}
              <div className="relative bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 h-full transition-all duration-500 hover:bg-gray-900/60 hover:border-gray-600/70 hover:transform hover:scale-105 hover:-translate-y-2 shadow-2xl hover:shadow-3xl">
                
                {/* Dynamic gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/10 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
                
                <div className="flex items-start gap-6 relative">
                  {/* Modern social icon */}
                  <div className="relative">
                    <div className="absolute -inset-2 bg-gradient-to-br from-purple-400 to-blue-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                    <div className="relative text-4xl h-16 w-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all duration-500">
                      {social.icon}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-white group-hover:text-purple-300 transition-colors duration-300">
                      {social.name}
                    </h3>
                    <div className="text-purple-400 text-sm mb-3 font-semibold">
                      {social.members}
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                      {social.description}
                    </p>
                  </div>
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-3xl" />
              </div>

              {/* Floating elements around card */}
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-700 animate-pulse" />
              <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-700 animate-pulse" />
            </a>
          ))}
        </div>

        {/* Modern newsletter section */}
        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-10 max-w-3xl mx-auto shadow-2xl">
          <h3 className="text-3xl font-bold text-center mb-6 text-white">Stay Updated</h3>
          <p className="text-gray-400 text-center mb-10 text-lg leading-relaxed">
            Get weekly updates on network stats, ecosystem growth, and development progress
          </p>
          <form
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row gap-6"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              disabled={subscribed}
              className="flex-1 px-6 py-4 rounded-2xl bg-gray-800/60 backdrop-blur-sm border border-gray-600/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 text-lg shadow-lg"
            />
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-75"></div>
              <button
                type="submit"
                disabled={subscribed}
                className="relative px-12 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {subscribed ? "✅ Subscribed!" : "Subscribe"}
              </button>
            </div>
          </form>
          <p className="text-sm text-gray-500 text-center mt-6">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </div>

        {/* Enhanced floating elements */}
        <div className="absolute top-40 left-40 w-3 h-3 bg-purple-400 rounded-full animate-pulse opacity-60" />
        <div className="absolute top-60 right-32 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-50" style={{animationDelay: '1s'}} />
        <div className="absolute bottom-40 left-20 w-4 h-4 bg-indigo-400 rounded-lg rotate-45 animate-pulse opacity-40" style={{animationDelay: '2s'}} />
        <div className="absolute bottom-60 right-40 w-2 h-2 bg-violet-400 rounded-full animate-pulse opacity-60" style={{animationDelay: '3s'}} />
      </div>
    </section>
  );
}
