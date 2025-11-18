import { PropsWithChildren } from 'react';
import clsx from 'clsx';

interface CardProps {
  title?: string;
  description?: string;
  elevation?: 'none' | 'soft' | 'strong';
  className?: string;
}

const elevationMap = {
  none: 'shadow-none border border-gray-100',
  soft: 'shadow-sm border border-gray-100',
  strong: 'shadow-lg border border-transparent',
};

export const Card = ({
  children,
  title,
  description,
  elevation = 'soft',
  className,
}: PropsWithChildren<CardProps>) => (
  <section
    className={clsx(
      'rounded-3xl bg-white p-6',
      elevationMap[elevation],
      className
    )}
  >
    {(title || description) && (
      <header className="mb-4">
        {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </header>
    )}
    <div>{children}</div>
  </section>
);
