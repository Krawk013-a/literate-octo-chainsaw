import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { navItems } from './navConfig';

export const SidebarNav = () => (
  <aside className="hidden w-72 border-r border-gray-200 bg-white pt-8 lg:block">
    <nav className="flex flex-col gap-1 px-6">
      {navItems.map(({ icon: Icon, label, path, badge }) => (
        <NavLink
          key={path}
          to={path}
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
);
