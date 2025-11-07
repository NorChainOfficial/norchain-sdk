import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title:
    "NorChain - Blockchain for Good | Fast, Affordable, EVM Compatible",
  description:
    "The world's first blockchain with built-in charity. 3-second blocks, sub-cent fees, and every transaction funds education, renewable energy, and humanitarian aid.",
  keywords: [
    "blockchain",
    "norchain",
    "cryptocurrency",
    "web3",
    "defi",
    "dex",
    "charity blockchain",
    "EVM compatible",
    "fast blockchain",
    "low fees",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
