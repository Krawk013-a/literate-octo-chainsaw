import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';

const UiPlaygroundPage = () => (
  <div className="space-y-6">
    <header>
      <h1 className="text-3xl font-bold text-gray-900">UI Playground</h1>
      <p className="mt-1 text-sm text-gray-500">
        Preview design tokens and primitives.
      </p>
    </header>

    <ResponsiveGrid>
      <Card title="Buttons" elevation="soft">
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="success">Success</Button>
          <Button variant="warning">Warning</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </Card>

      <Card title="Progress Ring">
        <div className="flex items-center gap-6">
          <ProgressRing progress={30} />
          <ProgressRing progress={70} color="#f97316" />
          <ProgressRing progress={95} color="#22c55e" />
        </div>
      </Card>
    </ResponsiveGrid>
  </div>
);

export default UiPlaygroundPage;
