import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
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
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider defaultTheme="system" storageKey="norchain-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
