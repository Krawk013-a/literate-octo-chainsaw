import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';

const AdminPage = () => (
  <div className="space-y-6">
    <header>
      <h1 className="text-3xl font-bold text-gray-900">Admin Console</h1>
      <p className="mt-1 text-sm text-gray-500">
        Monitor health metrics across the learning platform.
      </p>
    </header>

    <ResponsiveGrid>
      <Card title="Active Learners" elevation="strong">
        <p className="text-4xl font-bold text-gray-900">1,248</p>
        <p className="text-sm text-gray-500">+8% vs last week</p>
      </Card>
      <Card title="Realtime Sessions" elevation="strong">
        <p className="text-4xl font-bold text-gray-900">312</p>
        <p className="text-sm text-gray-500">+12% vs target</p>
      </Card>
      <Card title="API Latency" elevation="strong">
        <p className="text-4xl font-bold text-gray-900">128ms</p>
        <p className="text-sm text-gray-500">P95 across all regions</p>
      </Card>
    </ResponsiveGrid>

    <Card title="Maintenance Windows" description="Deployments & experiments">
      <div className="space-y-4">
        {[1, 2].map((item) => (
          <div key={item} className="flex items-center justify-between rounded-2xl border border-gray-100 p-4">
            <div>
              <p className="font-semibold text-gray-900">Release {item}.0.{item}</p>
              <p className="text-sm text-gray-500">Wednesday · 04:00 UTC</p>
            </div>
            <Button variant="secondary">View plan</Button>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

export default AdminPage;
