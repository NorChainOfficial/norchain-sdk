import { EnterpriseMonitoringDashboard } from '@/components/enterprise/EnterpriseMonitoringDashboard';

export const metadata = {
  title: 'Enterprise Monitoring | Nor Explorer',
  description: 'Real-time infrastructure monitoring dashboard',
};

export default function EnterprisePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <EnterpriseMonitoringDashboard />
    </div>
  );
}
