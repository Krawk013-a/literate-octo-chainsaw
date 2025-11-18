import type {
  ApiResponse,
  DashboardSummary,
  LeaderboardEntry,
  LessonOverview,
} from './types';
import {
  mockDashboardResponse,
  mockLeaderboardResponse,
  mockLessonsResponse,
} from './mockData';

interface RestClientOptions {
  baseUrl?: string;
  mode?: 'auto' | 'http' | 'mock';
}

const DEFAULT_BASE_URL = import.meta.env.VITE_API_URL as string | undefined;
const DEFAULT_MODE = (import.meta.env.VITE_API_MODE as RestClientOptions['mode']) || 'auto';

export class RestClient {
  constructor(private readonly options: RestClientOptions = {}) {}

  private get baseUrl() {
    return this.options.baseUrl ?? DEFAULT_BASE_URL;
  }

  private shouldUseHttp() {
    if (this.options.mode === 'http') return true;
    if (this.options.mode === 'mock') return false;
    return Boolean(this.baseUrl);
  }

  private async httpGet<T>(path: string, fallback: ApiResponse<T>) {
    if (!this.shouldUseHttp() || !this.baseUrl) {
      return fallback;
    }

    const response = await fetch(`${this.baseUrl}${path}`);
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    return (await response.json()) as ApiResponse<T>;
  }

  getDashboardSummary() {
    return this.httpGet<DashboardSummary>('/dashboard', mockDashboardResponse);
  }

  getLessons() {
    return this.httpGet<LessonOverview[]>('/lessons', mockLessonsResponse);
  }

  getLeaderboard() {
    return this.httpGet<LeaderboardEntry[]>('/leaderboard', mockLeaderboardResponse);
  }
}

let client: RestClient | null = null;

export const getRestClient = () => {
  if (!client) {
    client = new RestClient({
      baseUrl: DEFAULT_BASE_URL,
      mode: DEFAULT_MODE,
    });
  }
  return client;
};
