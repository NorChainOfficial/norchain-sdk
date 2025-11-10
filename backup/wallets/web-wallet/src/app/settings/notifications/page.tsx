'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SecurityCard } from '@/components/SecurityCard';
import { SettingsSection } from '@/components/SettingsSection';

export default function NotificationsPage() {
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
          <h1 className="text-4xl font-bold text-white">Notifications</h1>
          <p className="text-sm text-white/60">Transaction and price alerts</p>
        </div>
      </header>

      <div className="px-6 pb-8 space-y-6">
        <SettingsSection title="Notifications">
          <SecurityCard
            icon="📧"
            title="Transaction Alerts"
            subtitle="Get notified of transactions"
            badge="ON"
            onClick={() => {}}
          />
          <SecurityCard
            icon="🔔"
            title="Security Alerts"
            subtitle="Important security notifications"
            badge="ON"
            onClick={() => {}}
          />
          <SecurityCard
            icon="💰"
            title="Price Alerts"
            subtitle="Token price notifications"
            onClick={() => {}}
          />
        </SettingsSection>
      </div>
    </div>
  );
}

