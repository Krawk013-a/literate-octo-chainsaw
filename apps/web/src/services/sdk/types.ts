export type LanguageCode = 'en' | 'es' | 'fr' | 'it' | 'de' | 'ja';

export interface UserProfile {
  id: string;
  username: string;
  avatarUrl: string;
  streakDays: number;
  xp: number;
  league: 'Bronze' | 'Silver' | 'Gold' | 'Sapphire';
  currentCourse: LanguageCode;
}

export interface LessonOverview {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  progress: number;
  xp: number;
  language: LanguageCode;
  totalStages: number;
  completedStages: number;
  nextReviewAt: string;
}

export interface DashboardSummary {
  profile: UserProfile;
  weeklyXpGoal: number;
  weeklyXpProgress: number;
  leagueStanding: number;
  friendsLearning: number;
  upcomingReviews: number;
  activeLessons: LessonOverview[];
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  xp: number;
  isCurrentUser: boolean;
}

export interface LessonProgressEvent {
  lessonId: string;
  userId: string;
  xpEarned: number;
  accuracy: number;
  completedAt: string;
}

export interface NotificationEvent {
  id: string;
  message: string;
  createdAt: string;
}

export interface ApiMeta {
  requestId: string;
  generatedAt: string;
}

export type ApiResponse<T> = {
  data: T;
  meta: ApiMeta;
};

export interface RealtimeEvents {
  'lesson-progress': LessonProgressEvent;
  notification: NotificationEvent;
}
