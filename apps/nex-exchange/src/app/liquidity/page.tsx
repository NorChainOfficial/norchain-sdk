"use client";

import { useAccount } from "wagmi";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, TrendingUp, Wallet } from "lucide-react";
import { formatAmount } from "@/lib/utils";
import { PoolsList } from "@/components/liquidity/pools-list";
import { MyPositions } from "@/components/liquidity/my-positions";

export default function LiquidityPage() {
  const { address, isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Liquidity Pools</h1>
              <p className="text-foreground/70">
                Provide liquidity and earn trading fees
              </p>
            </div>

            {/* Show pools list even when not connected */}
            <PoolsList />

            {/* Connect wallet prompt */}
            <div className="bg-background border border-border rounded-lg p-12 text-center">
              <Wallet className="h-16 w-16 text-foreground/30 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Connect Your Wallet</h2>
              <p className="text-foreground/70">
                Connect your wallet to add liquidity and view your positions
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Liquidity Pools</h1>
            <p className="text-foreground/70">
              Provide liquidity and earn trading fees
            </p>
          </div>

          <Tabs defaultValue="pools" className="space-y-6">
            <TabsList>
              <TabsTrigger value="pools">All Pools</TabsTrigger>
              <TabsTrigger value="positions">My Positions</TabsTrigger>
              <TabsTrigger value="add">Add Liquidity</TabsTrigger>
              <TabsTrigger value="remove">Remove Liquidity</TabsTrigger>
            </TabsList>

            <TabsContent value="pools">
              <PoolsList />
            </TabsContent>

            <TabsContent value="positions">
              <MyPositions />
            </TabsContent>

            <TabsContent value="add">
              <div className="bg-background border border-border rounded-lg p-6 space-y-4">
                <h2 className="text-xl font-semibold flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Add Liquidity</span>
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Token A</Label>
                    <select className="w-full h-10 rounded-md border border-border bg-background px-3">
                      <option>NOR</option>
                      <option>BTCBR</option>
                      <option>DRHT</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Token B</Label>
                    <select className="w-full h-10 rounded-md border border-border bg-background px-3">
                      <option>USDT</option>
                      <option>NOR</option>
                      <option>DRHT</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Amount Token A</Label>
                    <Input type="number" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Amount Token B</Label>
                    <Input type="number" placeholder="0.00" />
                  </div>
                </div>
                <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground/70">Share of Pool</span>
                    <span className="font-semibold">0.01%</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground/70">Estimated APY</span>
                    <span className="font-semibold text-success flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>12.5%</span>
                    </span>
                  </div>
                </div>
                <Button className="w-full">Add Liquidity</Button>
              </div>
            </TabsContent>

            <TabsContent value="remove">
              <div className="max-w-2xl mx-auto">
                <div className="bg-background border border-border rounded-lg p-6 space-y-4">
                  <h2 className="text-xl font-semibold flex items-center space-x-2">
                    <Minus className="h-5 w-5" />
                    <span>Remove Liquidity</span>
                  </h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select Pool</Label>
                      <select className="w-full h-12 rounded-md border border-border bg-background px-3">
                        <option>NOR/USDT</option>
                        <option>NOR/BTCBR</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Amount to Remove</Label>
                        <Button variant="ghost" size="sm">Max</Button>
                      </div>
                      <Input type="number" placeholder="0.00" className="h-12" />
                      <div className="flex items-center justify-between text-sm text-foreground/70">
                        <span>Available:</span>
                        <span className="font-mono">1,500.00 LP</span>
                      </div>
                    </div>
                    <div className="p-4 bg-background/50 border border-border rounded-lg">
                      <div className="text-sm font-semibold text-foreground/70 mb-3">You will receive:</div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>NOR</span>
                          <span className="font-mono font-semibold">0.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>USDT</span>
                          <span className="font-mono font-semibold">0.00</span>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full h-12">Remove Liquidity</Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}

