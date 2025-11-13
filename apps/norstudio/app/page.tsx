'use client'

import React from 'react'
import Link from 'next/link'
import {
  Code2,
  Sparkles,
  FileCode,
  Rocket,
  Shield,
  Zap,
  ChevronRight,
  Plus,
  FolderOpen,
  BookOpen
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function HomePage(): JSX.Element {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Code2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  NorStudio
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI-Powered Smart Contract IDE
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <BookOpen className="h-4 w-4 mr-2" />
                Documentation
              </Button>
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
              Powered by AI
            </span>
          </div>
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Build Smart Contracts
            <br />
            <span className="bg-gradient-to-r from-primary-600 to-defi-600 bg-clip-text text-transparent">
              Faster with AI
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            NorStudio combines the power of Remix with AI assistance to help you
            build, test, and deploy smart contracts on NorChain.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button size="lg" className="h-14 px-8">
              <Plus className="h-5 w-5 mr-2" />
              New Project
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8">
              <FolderOpen className="h-5 w-5 mr-2" />
              Open Project
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <FeatureCard
            icon={<Sparkles className="h-6 w-6" />}
            title="AI-Powered Generation"
            description="Describe your contract in natural language and let AI generate production-ready Solidity code."
          />
          <FeatureCard
            icon={<Shield className="h-6 w-6" />}
            title="Security Audits"
            description="Real-time security analysis powered by NorAI to catch vulnerabilities before deployment."
          />
          <FeatureCard
            icon={<Zap className="h-6 w-6" />}
            title="Instant Compilation"
            description="Fast Solidity compilation with detailed error messages and optimization suggestions."
          />
          <FeatureCard
            icon={<FileCode className="h-6 w-6" />}
            title="Smart Templates"
            description="Start with battle-tested templates for tokens, NFTs, DeFi protocols, and more."
          />
          <FeatureCard
            icon={<Rocket className="h-6 w-6" />}
            title="One-Click Deploy"
            description="Deploy directly to NorChain mainnet or testnet with automatic verification."
          />
          <FeatureCard
            icon={<Code2 className="h-6 w-6" />}
            title="Interactive Testing"
            description="Test your contracts with an intuitive UI generated from your contract ABI."
          />
        </div>

        {/* Templates Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Start with a Template
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Production-ready templates to kickstart your project
              </p>
            </div>
            <Button variant="ghost">
              View All
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <TemplateCard
              title="ERC-20 Token"
              description="Standard fungible token"
              category="Token"
            />
            <TemplateCard
              title="NFT Collection"
              description="ERC-721 with metadata"
              category="NFT"
            />
            <TemplateCard
              title="DEX Pool"
              description="Automated market maker"
              category="DeFi"
            />
            <TemplateCard
              title="Escrow Contract"
              description="Secure payment escrow"
              category="Utility"
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary-600 to-defi-600 rounded-2xl p-12 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to start building?
          </h3>
          <p className="text-white/90 mb-8 text-lg">
            Join thousands of developers building on NorChain with NorStudio
          </p>
          <Button size="lg" variant="secondary" className="h-14 px-8">
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Project
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <p>© 2025 NorChain. All rights reserved.</p>
            <div className="flex items-center space-x-6">
              <Link href="/docs" className="hover:text-primary-600 transition-colors">
                Documentation
              </Link>
              <Link href="/support" className="hover:text-primary-600 transition-colors">
                Support
              </Link>
              <Link href="/api" className="hover:text-primary-600 transition-colors">
                API
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

interface FeatureCardProps {
  readonly icon: React.ReactNode
  readonly title: string
  readonly description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps): JSX.Element {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="h-12 w-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4">
        {icon}
      </div>
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h4>
      <p className="text-gray-600 dark:text-gray-400 text-sm">
        {description}
      </p>
    </Card>
  )
}

interface TemplateCardProps {
  readonly title: string
  readonly description: string
  readonly category: string
}

function TemplateCard({ title, description, category }: TemplateCardProps): JSX.Element {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <div className="h-10 w-10 rounded-lg bg-defi-100 dark:bg-defi-900/30 flex items-center justify-center">
          <FileCode className="h-5 w-5 text-defi-600 dark:text-defi-400" />
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
          {category}
        </span>
      </div>
      <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
        {title}
      </h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </Card>
  )
}
