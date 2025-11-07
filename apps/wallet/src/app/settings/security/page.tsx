'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SecurityCard } from '@/components/SecurityCard';
import { SettingsSection } from '@/components/SettingsSection';

export default function SecurityPage() {
  const router = useRouter();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(false);

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
          <h1 className="text-4xl font-bold text-white">Security</h1>
          <p className="text-sm text-white/60">Protect your wallet and funds</p>
        </div>
      </header>

      <div className="px-6 pb-8 space-y-6">
        {/* Authentication Section */}
        <SettingsSection title="Authentication">
          <SecurityCard
            icon="🔐"
            title="Biometric Authentication"
            subtitle={biometricEnabled ? "Enabled" : "Enable to unlock wallet"}
            badge={biometricEnabled ? "ON" : undefined}
            onClick={() => setBiometricEnabled(!biometricEnabled)}
          />
          <SecurityCard
            icon="🔑"
            title="PIN"
            subtitle={pinEnabled ? "Enabled" : "Set up PIN"}
            badge={pinEnabled ? "ON" : undefined}
            onClick={() => router.push('/settings/security/pin')}
          />
        </SettingsSection>

        {/* Backup Section */}
        <SettingsSection title="Backup">
          <SecurityCard
            icon="📝"
            title="Seed Phrase"
            subtitle="View your recovery phrase"
            onClick={() => router.push('/settings/security/seed-phrase')}
          />
          <SecurityCard
            icon="🔑"
            title="Export Private Key"
            subtitle="View your private key"
            onClick={() => router.push('/private-key')}
          />
        </SettingsSection>

        {/* Settings Section */}
        <SettingsSection title="Settings">
          <SecurityCard
            icon="⏱️"
            title="Auto Lock"
            subtitle="Configure auto-lock timer"
            onClick={() => router.push('/settings/security/auto-lock')}
          />
        </SettingsSection>
      </div>
    </div>
  );
}

