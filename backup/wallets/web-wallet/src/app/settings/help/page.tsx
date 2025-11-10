'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SecurityCard } from '@/components/SecurityCard';
import { SettingsSection } from '@/components/SettingsSection';

export default function HelpPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-primary">
      <header className="px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition-colors"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-white">Help & Support</h1>
          <p className="text-sm text-white/60">FAQ, contact, user guide</p>
        </div>
      </header>

      <div className="px-6 pb-8 space-y-6">
        <SettingsSection title="Support">
          <SecurityCard
            icon="❓"
            title="FAQ"
            subtitle="Frequently asked questions"
            onClick={() => {}}
          />
          <SecurityCard
            icon="📧"
            title="Contact Us"
            subtitle="Get in touch with support"
            onClick={() => {}}
          />
          <SecurityCard
            icon="📖"
            title="User Guide"
            subtitle="Learn how to use Nor Wallet"
            onClick={() => {}}
          />
        </SettingsSection>

        <SettingsSection title="Community">
          <SecurityCard
            icon="💬"
            title="Telegram"
            subtitle="Join our community"
            onClick={() => {}}
          />
          <SecurityCard
            icon="🐦"
            title="Twitter"
            subtitle="Follow us for updates"
            onClick={() => {}}
          />
          <SecurityCard
            icon="🌐"
            title="Website"
            subtitle="Visit our website"
            onClick={() => {}}
          />
        </SettingsSection>

        <SettingsSection title="Legal">
          <SecurityCard
            icon="📄"
            title="Terms of Service"
            subtitle="Read our terms"
            onClick={() => {}}
          />
          />
          <SecurityCard
            icon="🔒"
            title="Privacy Policy"
            subtitle="How we protect your data"
            onClick={() => {}}
          />
        </SettingsSection>
      </div>
    </div>
  );
}

