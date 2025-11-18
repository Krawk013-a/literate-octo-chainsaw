import { Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { TopBar } from './TopBar';
import { SidebarNav } from './SidebarNav';
import { MobileNavDrawer } from './MobileNavDrawer';

export const AppShell = () => {
  const isMobileNavOpen = useAppSelector((state) => state.layout.isMobileNavOpen);

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <SidebarNav />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
      {isMobileNavOpen && <MobileNavDrawer />}
    </div>
  );
};
