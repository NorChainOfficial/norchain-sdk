'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SecurityCard } from '@/components/SecurityCard';
import { SettingsSection } from '@/components/SettingsSection';

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-primary">
      {/* Header */}
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
          <h1 className="text-4xl font-bold text-white">Settings</h1>
          <p className="text-sm text-white/60">Manage your wallet preferences</p>
        </div>
      </header>

      <div className="px-6 pb-8 space-y-6">
        {/* Security Section */}
        <SettingsSection title="Security">
          <SecurityCard
            title="Security"
            subtitle="Biometric, PIN, backup"
            onClick={() => router.push('/settings/security')}
          />
        </SettingsSection>

        {/* Preferences Section */}
        <SettingsSection title="Preferences">
          <SecurityCard
            title="Notifications"
            subtitle="Transaction and price alerts"
            onClick={() => router.push('/settings/notifications')}
          />
          <SecurityCard
            title="Network"
            subtitle="Switch blockchain networks"
            onClick={() => router.push('/settings/network')}
          />
        </SettingsSection>

        {/* Support Section */}
        <SettingsSection title="Support">
          <SecurityCard
            title="Help & Support"
            subtitle="FAQ, contact, user guide"
            onClick={() => router.push('/settings/help')}
          />
          <SecurityCard
            title="About"
            subtitle="App version and information"
            onClick={() => router.push('/about')}
          />
        </SettingsSection>
      </div>
    </div>
  );
}

