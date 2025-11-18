import { api } from './baseApi';
import type { LessonOverview } from '../sdk/types';
import { getRestClient } from '../sdk/restClient';

const restClient = getRestClient();

export const lessonsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getLessons: builder.query<LessonOverview[], void>({
      queryFn: async () => {
        try {
          const response = await restClient.getLessons();
          return { data: response.data };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: ['Lessons'],
    }),
  }),
});

export const { useGetLessonsQuery } = lessonsApi;
