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
    <section className="py-20 bg-gradient-to-br from-blue-900 to-purple-900 text-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Join the Noor Community
          </h2>
          <p className="text-xl text-blue-200">
            Connect with developers, validators, and blockchain enthusiasts
            worldwide
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="text-5xl group-hover:scale-110 transition-transform">
                  {social.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">{social.name}</h3>
                  <div className="text-blue-300 text-sm mb-2">
                    {social.members}
                  </div>
                  <p className="text-gray-300 text-sm">{social.description}</p>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Newsletter */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-4">Stay Updated</h3>
          <p className="text-blue-200 text-center mb-6">
            Get weekly updates on network stats, ecosystem growth, and charity
            impact
          </p>
          <form
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row gap-4"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={subscribed}
              className="flex-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={subscribed}
              className="px-8 py-3 bg-white text-blue-900 rounded-lg font-semibold hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {subscribed ? "✅ Subscribed!" : "Subscribe"}
            </button>
          </form>
          <p className="text-xs text-blue-300 text-center mt-4">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
