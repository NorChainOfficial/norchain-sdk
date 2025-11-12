"use client";

export default function WhyNor() {
  const comparisons = [
    {
      feature: "Block Time",
      nor: "3 seconds",
      ethereum: "12 seconds",
      polygon: "2 seconds",
    },
    {
      feature: "Gas Fees",
      nor: "<$0.001",
      ethereum: "$5-50",
      polygon: "$0.01-0.05",
    },
    {
      feature: "Finality",
      nor: "3 seconds",
      ethereum: "12+ minutes",
      polygon: "~2 minutes",
    },
    { feature: "TPS", nor: "1000+", ethereum: "15-30", polygon: "65+" },
    { feature: "EVM Compatible", nor: "✅", ethereum: "✅", polygon: "✅" },
    {
      feature: "Built-in Charity",
      nor: "✅ 5% fees",
      ethereum: "❌",
      polygon: "❌",
    },
    {
      feature: "Carbon Neutral",
      nor: "✅ Offset",
      ethereum: "✅ PoS",
      polygon: "✅ PoS",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900">
          Why Nor?
        </h2>
        <p className="text-center text-gray-600 mb-12 text-lg">
          How we compare to other leading blockchains
        </p>

        <div className="max-w-5xl mx-auto overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-lg rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <th className="px-6 py-4 text-left font-bold">Feature</th>
                <th className="px-6 py-4 text-center font-bold bg-blue-800">
                  Nor
                </th>
                <th className="px-6 py-4 text-center font-bold">Ethereum</th>
                <th className="px-6 py-4 text-center font-bold">Polygon</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((row, index) => (
                <tr
                  key={row.feature}
                  className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="px-6 py-4 font-semibold text-gray-900 border-t border-gray-200">
                    {row.feature}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-blue-700 bg-blue-50 border-t border-gray-200">
                    {row.nor}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600 border-t border-gray-200">
                    {row.ethereum}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600 border-t border-gray-200">
                    {row.polygon}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 text-lg mb-6">
            Want the full technical comparison?
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://docs.norchain.org/technical/comparison"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Download Technical Whitepaper
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </a>
            <a
              href="https://explorer.norchain.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gray-100 text-gray-900 rounded-lg font-semibold hover:bg-gray-200 transition-all shadow-lg hover:scale-105"
            >
              Try the Explorer
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
          </div>
        </div>
      </div>
    </section>
  );
}
