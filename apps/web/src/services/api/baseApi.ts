import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  reducerPath: 'webApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Dashboard', 'Lessons', 'Leaderboard'],
  endpoints: () => ({}),
});
