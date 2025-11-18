import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';

const mockChallenges = [
  {
    id: 'challenge-1',
    title: 'Speed Round',
    description: 'Complete 5 lessons in under 10 minutes.',
    reward: '+150 XP',
  },
  {
    id: 'challenge-2',
    title: 'Perfect Accuracy',
    description: 'Finish a lesson without mistakes.',
    reward: '+200 XP',
  },
  {
    id: 'challenge-3',
    title: 'Flash Review',
    description: 'Review 3 old lessons by tonight.',
    reward: '+100 XP',
  },
];

const ChallengesPage = () => (
  <div className="space-y-6">
    <header>
      <h1 className="text-3xl font-bold text-gray-900">Daily Challenges</h1>
      <p className="mt-1 text-sm text-gray-500">
        Power up your streak with limited-time missions.
      </p>
    </header>

    <ResponsiveGrid>
      {mockChallenges.map((challenge) => (
        <Card
          key={challenge.id}
          title={challenge.title}
          description={challenge.description}
          elevation="soft"
        >
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-primary-600">
              {challenge.reward}
            </p>
            <Button size="sm">Start</Button>
          </div>
        </Card>
      ))}
    </ResponsiveGrid>
  </div>
);

export default ChallengesPage;
