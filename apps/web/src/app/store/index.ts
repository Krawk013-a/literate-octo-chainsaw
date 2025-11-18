import { configureStore } from '@reduxjs/toolkit';
import { api } from '@/services/api/baseApi';
import layoutReducer from './slices/layoutSlice';

export const store = configureStore({
  reducer: {
    layout: layoutReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
