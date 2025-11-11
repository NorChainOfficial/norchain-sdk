'use client';

import React from 'react';
import { useApiKeys } from '@/hooks/useApiKeys';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function DashboardPage(): JSX.Element {
  const { keys, loading: keysLoading } = useApiKeys();
  const { metrics, loading: metricsLoading } = useAnalytics();

  const activeKeys = keys.filter(k => k.isActive);
  const totalRequests = metrics?.totalRequests || 0;
  const successRate = metrics?.totalRequests
    ? ((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Developer Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Manage your API keys, monitor usage, and access documentation
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active API Keys"
          value={keysLoading ? '...' : activeKeys.length.toString()}
          icon={<KeyIcon />}
          color="blue"
        />
        <StatCard
          title="Total Requests"
          value={metricsLoading ? '...' : totalRequests.toLocaleString()}
          icon={<RequestIcon />}
          color="green"
        />
        <StatCard
          title="Success Rate"
          value={metricsLoading ? '...' : `${successRate}%`}
          icon={<CheckIcon />}
          color="purple"
        />
        <StatCard
          title="Avg Response Time"
          value={metricsLoading ? '...' : `${metrics?.averageResponseTime || 0}ms`}
          icon={<ClockIcon />}
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard
            title="Create API Key"
            description="Generate a new API key"
            href="/keys"
            icon={<PlusIcon />}
          />
          <QuickActionCard
            title="View Analytics"
            description="See detailed usage metrics"
            href="/analytics"
            icon={<ChartIcon />}
          />
          <QuickActionCard
            title="API Sandbox"
            description="Test API endpoints"
            href="/sandbox"
            icon={<PlayIcon />}
          />
        </div>
      </div>

      {/* Getting Started */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Getting Started</h2>
        <div className="space-y-4">
          <Step number={1} title="Create an API Key" description="Generate your first API key to start making requests" />
          <Step number={2} title="Read the Documentation" description="Learn about available endpoints and parameters" />
          <Step number={3} title="Make Your First Request" description="Use the API Sandbox to test endpoints" />
          <Step number={4} title="Set Up Webhooks" description="Get real-time notifications for events" />
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  readonly title: string;
  readonly value: string;
  readonly icon: React.ReactNode;
  readonly color: 'blue' | 'green' | 'purple' | 'orange';
}

function StatCard({ title, value, icon, color }: StatCardProps): JSX.Element {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`flex h-14 w-14 items-center justify-center rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

interface QuickActionCardProps {
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly icon: React.ReactNode;
}

function QuickActionCard({ title, description, href, icon }: QuickActionCardProps): JSX.Element {
  return (
    <a
      href={href}
      className="flex flex-col items-center p-6 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-blue-50 transition-all group"
    >
      <div className="h-12 w-12 text-gray-600 group-hover:text-primary transition-colors mb-3">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 text-center">{title}</h3>
      <p className="text-sm text-gray-600 text-center mt-1">{description}</p>
    </a>
  );
}

interface StepProps {
  readonly number: number;
  readonly title: string;
  readonly description: string;
}

function Step({ number, title, description }: StepProps): JSX.Element {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-bold text-sm">
        {number}
      </div>
      <div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  );
}

// Icons
function KeyIcon(): JSX.Element {
  return (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  );
}

function RequestIcon(): JSX.Element {
  return (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function CheckIcon(): JSX.Element {
  return (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ClockIcon(): JSX.Element {
  return (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function PlusIcon(): JSX.Element {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function ChartIcon(): JSX.Element {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function PlayIcon(): JSX.Element {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
