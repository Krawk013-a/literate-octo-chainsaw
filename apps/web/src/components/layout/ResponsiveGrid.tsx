import { PropsWithChildren } from 'react';
import clsx from 'clsx';

interface ResponsiveGridProps {
  min?: number;
  gap?: string;
  className?: string;
}

export const ResponsiveGrid = ({
  children,
  min = 260,
  gap = '1rem',
  className,
}: PropsWithChildren<ResponsiveGridProps>) => (
  <div
    className={clsx('grid', className)}
    style={{
      gap,
      gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`,
    }}
  >
    {children}
  </div>
);
