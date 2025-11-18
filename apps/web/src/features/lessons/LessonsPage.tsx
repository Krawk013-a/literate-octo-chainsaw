import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { useGetLessonsQuery } from '@/services/api/lessonsApi';
import { mockLessonsResponse } from '@/services/sdk/mockData';

const LessonsPage = () => {
  const { data, isLoading, error } = useGetLessonsQuery();
  const lessons = data ?? mockLessonsResponse.data;

  if (isLoading) {
    return <p className="text-gray-500">Loading lessons...</p>;
  }

  if (error) {
    console.warn('Lessons API error, using mock data:', error);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Lessons</h1>
        <p className="mt-1 text-sm text-gray-500">
          Pick a module to keep your streak alive.
        </p>
      </header>

      <ResponsiveGrid>
        {lessons.map((lesson) => (
          <Card key={lesson.id} elevation="soft">
            <div className="space-y-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  {lesson.language.toUpperCase()}
                </p>
                <h3 className="text-lg font-semibold text-gray-900">
                  {lesson.title}
                </h3>
                <p className="text-sm text-gray-500">{lesson.description}</p>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>{lesson.difficulty}</span>
                <span>
                  {lesson.completedStages}/{lesson.totalStages} stages
                </span>
              </div>
              <Button variant="secondary" fullWidth>
                Continue lesson
              </Button>
            </div>
          </Card>
        ))}
      </ResponsiveGrid>
    </div>
  );
};

export default LessonsPage;
