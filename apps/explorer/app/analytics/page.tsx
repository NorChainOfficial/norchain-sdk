import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';

export const metadata = {
  title: 'Analytics Dashboard - Noor Explorer',
  description: 'Real-time blockchain analytics, token metrics, gas tracker, and portfolio insights for NorChain',
};

export default function AnalyticsPage(): JSX.Element {
  return <AnalyticsDashboard />;
}
