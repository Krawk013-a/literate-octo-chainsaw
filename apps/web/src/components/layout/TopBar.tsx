import { Menu, Trophy, Flame } from 'lucide-react';
import { useAppDispatch } from '@/app/hooks';
import { toggleMobileNav } from '@/app/store/slices/layoutSlice';
import { Button } from '../ui/Button';

export const TopBar = () => {
  const dispatch = useAppDispatch();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center border-b border-gray-200 bg-white px-4 shadow-sm md:px-6">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => dispatch(toggleMobileNav())}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary-600" />
            <h1 className="hidden text-xl font-bold text-gray-900 sm:block">
              LinguaLearn
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-700">
            <Flame className="h-4 w-4" />
            <span>24</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-1.5 text-sm font-medium text-yellow-700">
            <Trophy className="h-4 w-4" />
            <span>18250</span>
          </div>
          <Button variant="ghost" size="sm" className="hidden sm:block">
            Profile
          </Button>
        </div>
      </div>
    </header>
  );
};

const GraduationCap = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);
