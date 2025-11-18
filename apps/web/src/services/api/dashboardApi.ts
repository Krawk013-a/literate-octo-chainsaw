import { api } from './baseApi';
import type { DashboardSummary, LeaderboardEntry } from '../sdk/types';
import { getRestClient } from '../sdk/restClient';

const restClient = getRestClient();

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<DashboardSummary, void>({
      queryFn: async () => {
        try {
          const response = await restClient.getDashboardSummary();
          return { data: response.data };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: ['Dashboard'],
    }),
    getLeaderboard: builder.query<LeaderboardEntry[], void>({
      queryFn: async () => {
        try {
          const response = await restClient.getLeaderboard();
          return { data: response.data };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: ['Leaderboard'],
    }),
  }),
});

export const { useGetDashboardQuery, useGetLeaderboardQuery } = dashboardApi;
