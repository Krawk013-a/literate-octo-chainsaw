import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import clsx from 'clsx';
import { useAppDispatch } from '@/app/hooks';
import { closeMobileNav } from '@/app/store/slices/layoutSlice';
import { navItems } from './navConfig';

export const MobileNavDrawer = () => {
  const dispatch = useAppDispatch();

  const handleClose = () => {
    dispatch(closeMobileNav());
  };

  return (
    <>
      <div
        className="fixed inset-0 z-30 bg-black/50 lg:hidden"
        onClick={handleClose}
      />
      <aside className="fixed inset-y-0 left-0 z-40 w-72 bg-white shadow-xl lg:hidden">
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
          <h2 className="text-lg font-bold text-gray-900">Menu</h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            aria-label="Close navigation"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 px-6 pt-6">
          {navItems.map(({ icon: Icon, label, path, badge }) => (
            <NavLink
              key={path}
              to={path}
              onClick={handleClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-all hover:bg-gray-50',
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600'
                )
              }
            >
              <span className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                {label}
              </span>
              {badge && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs uppercase tracking-wide text-gray-500">
                  {badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};
