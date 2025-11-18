import type {
  ApiResponse,
  DashboardSummary,
  LeaderboardEntry,
  LessonOverview,
  UserProfile,
} from './types';

const now = new Date().toISOString();

const profile: UserProfile = {
  id: 'user-123',
  username: 'PolyglotPenguin',
  avatarUrl: 'https://avatars.githubusercontent.com/u/000?v=4',
  streakDays: 24,
  xp: 18250,
  league: 'Gold',
  currentCourse: 'es',
};

const lessons: LessonOverview[] = [
  {
    id: 'lesson-1',
    title: 'Ordering Coffee',
    description: 'Practice ordering food and drinks with confidence.',
    difficulty: 'beginner',
    progress: 65,
    xp: 560,
    language: 'es',
    totalStages: 10,
    completedStages: 6,
    nextReviewAt: now,
  },
  {
    id: 'lesson-2',
    title: 'Travel Smarter',
    description: 'Navigate airports, trains, and cabs like a native.',
    difficulty: 'intermediate',
    progress: 34,
    xp: 420,
    language: 'fr',
    totalStages: 12,
    completedStages: 4,
    nextReviewAt: now,
  },
  {
    id: 'lesson-3',
    title: 'Debate Club',
    description: 'Build advanced opinions and argue persuasively.',
    difficulty: 'advanced',
    progress: 12,
    xp: 300,
    language: 'de',
    totalStages: 14,
    completedStages: 2,
    nextReviewAt: now,
  },
];

const leaderboard: LeaderboardEntry[] = [
  { id: 'user-123', username: 'PolyglotPenguin', xp: 2160, isCurrentUser: true },
  { id: 'user-456', username: 'GrammarGoat', xp: 1985, isCurrentUser: false },
  { id: 'user-789', username: 'SyntaxSeal', xp: 1750, isCurrentUser: false },
];

export const mockDashboardResponse: ApiResponse<DashboardSummary> = {
  data: {
    profile,
    weeklyXpGoal: 2100,
    weeklyXpProgress: 1260,
    leagueStanding: 3,
    friendsLearning: 12,
    upcomingReviews: 4,
    activeLessons: lessons,
  },
  meta: {
    requestId: 'mock-dashboard',
    generatedAt: now,
  },
};

export const mockLessonsResponse: ApiResponse<LessonOverview[]> = {
  data: lessons,
  meta: {
    requestId: 'mock-lessons',
    generatedAt: now,
  },
};

export const mockLeaderboardResponse: ApiResponse<LeaderboardEntry[]> = {
  data: leaderboard,
  meta: {
    requestId: 'mock-leaderboard',
    generatedAt: now,
  },
};
