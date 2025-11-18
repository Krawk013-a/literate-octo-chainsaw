import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

const NotFoundPage = () => (
  <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
    <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">
      404
    </p>
    <h1 className="mt-2 text-3xl font-bold text-gray-900">
      Lost in translation?
    </h1>
    <p className="mt-2 max-w-md text-sm text-gray-500">
      We couldn't find that page. Let's get you back to your learning journey.
    </p>
    <Link to="/dashboard" className="mt-6">
      <Button>Back to dashboard</Button>
    </Link>
  </div>
);

export default NotFoundPage;
