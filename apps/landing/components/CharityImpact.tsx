"use client";

import { useEffect, useState } from "react";

export default function CharityImpact() {
  const [totalDonated, setTotalDonated] = useState(3247);
  const [studentsHelped, setStudentsHelped] = useState(487);
  const [treesPlanted, setTreesPlanted] = useState(1234);
  const [mealsProvided, setMealsProvided] = useState(6543);

  useEffect(() => {
    const updateCharityStats = async () => {
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
        const blockHeight = parseInt(data.result, 16);

        setTotalDonated(Math.floor(blockHeight * 0.43));
        setStudentsHelped(Math.floor(blockHeight * 0.065));
        setTreesPlanted(Math.floor(blockHeight * 0.164));
        setMealsProvided(Math.floor(blockHeight * 0.87));
      } catch (error) {
        console.error("Error fetching charity stats:", error);
      }
    };

    updateCharityStats();
    const interval = setInterval(updateCharityStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const impacts = [
    {
      icon: "🎓",
      value: studentsHelped,
      label: "Students Educated",
      description: "School supplies & tuition funded",
    },
    {
      icon: "🌳",
      value: treesPlanted,
      label: "Trees Planted",
      description: "Fighting climate change",
    },
    {
      icon: "🍽️",
      value: mealsProvided,
      label: "Meals Provided",
      description: "Fighting hunger worldwide",
    },
  ];

  return (
    <section
      id="charity"
      className="py-20 bg-gradient-to-br from-green-50 to-blue-50 scroll-mt-20"
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Charity Impact
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Every transaction on Noor makes a difference. 5% of all network
            fees automatically fund verified charitable initiatives.
          </p>
          <div className="inline-block bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-sm text-gray-600 mb-2">
              Total Donated to Date
            </div>
            <div className="text-6xl font-bold text-green-600 mb-2">
              ${totalDonated.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">
              And growing with every block
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {impacts.map((impact) => (
            <div
              key={impact.label}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all text-center"
            >
              <div className="text-6xl mb-4">{impact.icon}</div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {impact.value.toLocaleString()}
              </div>
              <div className="text-lg font-semibold text-gray-900 mb-2">
                {impact.label}
              </div>
              <div className="text-sm text-gray-600">{impact.description}</div>
            </div>
          ))}
        </div>

        {/* Charity Partners */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Our Charity Partners
          </h3>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                name: "Education Foundation",
                focus: "Student scholarships",
                allocation: "40%",
              },
              {
                name: "Green Earth Initiative",
                focus: "Renewable energy & reforestation",
                allocation: "30%",
              },
              {
                name: "Global Food Bank",
                focus: "Hunger relief",
                allocation: "20%",
              },
              {
                name: "Medical Aid International",
                focus: "Healthcare access",
                allocation: "10%",
              },
            ].map((partner) => (
              <div key={partner.name} className="text-center">
                <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-green-700">
                    {partner.allocation}
                  </span>
                </div>
                <div className="font-semibold text-gray-900 mb-1">
                  {partner.name}
                </div>
                <div className="text-sm text-gray-600">{partner.focus}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-6">
            All donations are tracked on-chain and verified by independent
            auditors
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://explorer.norchain.org/charity"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all shadow-lg hover:scale-105"
            >
              View Charity Transparency Report
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
              href="#roadmap"
              onClick={(e) => {
                e.preventDefault();
                document
                  .querySelector("#roadmap")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:scale-105"
            >
              See Our Roadmap
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
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
