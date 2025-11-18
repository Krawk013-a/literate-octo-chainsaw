import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { RouteFallback } from '@/components/layout/RouteFallback';

const Dashboard = lazy(() => import('@/features/dashboard/DashboardPage'));
const Lessons = lazy(() => import('@/features/lessons/LessonsPage'));
const Auth = lazy(() => import('@/features/auth/AuthPage'));
const Admin = lazy(() => import('@/features/admin/AdminPage'));
const Playground = lazy(() => import('@/features/playground/UiPlaygroundPage'));
const NotFound = lazy(() => import('@/features/errors/NotFoundPage'));

const AppRouter = () => (
  <Suspense fallback={<RouteFallback />}>
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/lessons" element={<Lessons />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/playground" element={<Playground />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

export default AppRouter;
