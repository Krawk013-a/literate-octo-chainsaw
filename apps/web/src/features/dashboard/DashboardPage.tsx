import { Card } from '@/components/ui/Card';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Button } from '@/components/ui/Button';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { Trophy, Users, Clock, TrendingUp } from 'lucide-react';
import { useGetDashboardQuery } from '@/services/api/dashboardApi';
import { mockDashboardResponse } from '@/services/sdk/mockData';

const DashboardPage = () => {
  const { data, isLoading, error } = useGetDashboardQuery(undefined, {
    pollingInterval: 30000,
  });

  const dashboard = data || mockDashboardResponse.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    console.warn('Dashboard API error, using mock data:', error);
  }

  const weeklyProgress =
    (dashboard.weeklyXpProgress / dashboard.weeklyXpGoal) * 100;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {dashboard.profile.username}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Keep up your streak – you're doing amazing! 🔥
        </p>
      </header>

      <ResponsiveGrid>
        <Card title="Weekly XP Goal" elevation="soft">
          <div className="flex items-center gap-4">
            <ProgressRing progress={weeklyProgress} size={80} />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {dashboard.weeklyXpProgress}
                <span className="text-sm font-normal text-gray-500">
                  {' '}
                  / {dashboard.weeklyXpGoal}
                </span>
              </p>
              <p className="text-sm text-gray-500">
                {Math.round(weeklyProgress)}% of goal
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-50">
              <Trophy className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {dashboard.profile.league}
              </p>
              <p className="text-sm text-gray-500">
                #{dashboard.leagueStanding} standing
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {dashboard.friendsLearning}
              </p>
              <p className="text-sm text-gray-500">Friends learning</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {dashboard.upcomingReviews}
              </p>
              <p className="text-sm text-gray-500">Upcoming reviews</p>
            </div>
          </div>
        </Card>
      </ResponsiveGrid>

      <Card title="Active Lessons" elevation="soft">
        <div className="space-y-4">
          {dashboard.activeLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="flex items-center justify-between rounded-2xl border border-gray-100 p-4 transition-all hover:border-primary-300 hover:bg-primary-50/30"
            >
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900">
                  {lesson.title}
                </h3>
                <p className="text-sm text-gray-500">{lesson.description}</p>
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {lesson.difficulty}
                  </span>
                  <span>
                    {lesson.completedStages}/{lesson.totalStages} stages
                  </span>
                </div>
              </div>
              <div className="ml-4 flex items-center gap-4">
                <ProgressRing progress={lesson.progress} size={60} strokeWidth={6} />
                <Button size="sm">Continue</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;
