'use client';

import { useState } from 'react';
import { Brain, Zap, Shield, TrendingUp, AlertTriangle, MessageSquare, Sparkles } from 'lucide-react';
import { TransactionAnalysis } from '@/components/TransactionAnalysis';
import { ContractAudit } from '@/components/ContractAudit';
import { GasPrediction } from '@/components/GasPrediction';
import { AnomalyDetection } from '@/components/AnomalyDetection';
import { PortfolioOptimization } from '@/components/PortfolioOptimization';
import { AIChat } from '@/components/AIChat';

const features = [
  {
    id: 'transaction',
    title: 'Transaction Analysis',
    description: 'AI-powered transaction analysis with risk scoring and insights',
    icon: Zap,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
  },
  {
    id: 'audit',
    title: 'Contract Audit',
    description: 'Smart contract security audit with vulnerability detection',
    icon: Shield,
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
  },
  {
    id: 'gas',
    title: 'Gas Prediction',
    description: 'Predict optimal gas prices using AI and historical data',
    icon: TrendingUp,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
  },
  {
    id: 'anomaly',
    title: 'Anomaly Detection',
    description: 'Detect suspicious patterns and anomalies in addresses',
    icon: AlertTriangle,
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
  },
  {
    id: 'portfolio',
    title: 'Portfolio Optimization',
    description: 'AI-powered portfolio optimization recommendations',
    icon: Brain,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
  },
  {
    id: 'chat',
    title: 'AI Chat Assistant',
    description: 'Ask questions about blockchain, transactions, and DeFi',
    icon: MessageSquare,
    color: 'text-pink-400',
    bgColor: 'bg-pink-400/10',
  },
];

export default function HomePage() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const renderFeature = () => {
    switch (activeFeature) {
      case 'transaction':
        return <TransactionAnalysis onBack={() => setActiveFeature(null)} />;
      case 'audit':
        return <ContractAudit onBack={() => setActiveFeature(null)} />;
      case 'gas':
        return <GasPrediction onBack={() => setActiveFeature(null)} />;
      case 'anomaly':
        return <AnomalyDetection onBack={() => setActiveFeature(null)} />;
      case 'portfolio':
        return <PortfolioOptimization onBack={() => setActiveFeature(null)} />;
      case 'chat':
        return <AIChat onBack={() => setActiveFeature(null)} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {activeFeature ? (
        <div className="container mx-auto px-4 py-8">{renderFeature()}</div>
      ) : (
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                NorAI
              </h1>
            </div>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
              AI-powered blockchain analytics and automation layer for NorChain
            </p>
            <p className="text-sm text-foreground/50 mt-2">
              Transaction analysis • Contract auditing • Gas prediction • Anomaly detection • Portfolio optimization • AI chat
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeature(feature.id)}
                  className={`group relative p-6 rounded-xl border border-border bg-background hover:border-primary/50 transition-all duration-200 text-left ${feature.bgColor} hover:scale-105`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${feature.bgColor} ${feature.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-foreground/60">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to explore →
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-16 text-center text-sm text-foreground/50">
            <p>Powered by NorChain Unified API • Port 4013</p>
          </div>
        </div>
      )}
    </div>
  );
}

