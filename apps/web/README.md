# Web Frontend - LinguaLearn

Modern React + TypeScript SPA with responsive design, state management, and real-time capabilities.

## 🏗️ Architecture

### Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Router**: React Router v6 with lazy-loaded routes
- **State Management**: Redux Toolkit + RTK Query
- **Styling**: Tailwind CSS + PostCSS
- **Real-time**: Socket.io-client with reconnection logic
- **Icons**: Lucide React
- **Testing**: Vitest + Testing Library

### Folder Structure

```
src/
├── app/                        # App core (router, providers, store)
│   ├── hooks/                  # Typed Redux hooks
│   ├── providers/              # React context providers
│   ├── router.tsx              # Route definitions
│   ├── store/
│   │   ├── index.ts            # Store configuration
│   │   └── slices/             # Redux slices
│   └── App.tsx
├── components/
│   ├── layout/                 # Layout primitives (AppShell, TopBar, etc.)
│   └── ui/                     # Reusable UI components (Button, Card, etc.)
├── features/                   # Feature modules (dashboard, lessons, auth, etc.)
│   └── [feature]/              # Each feature has its page components
├── services/
│   ├── api/                    # RTK Query API definitions
│   ├── realtime/               # WebSocket client
│   └── sdk/                    # Shared types and mock data
├── styles/
│   └── globals.css             # Global Tailwind styles
├── test/
│   └── setup.ts                # Test configuration
├── main.tsx                    # Entry point
└── vite-env.d.ts
```

## 🎨 Design System

### Color Palette

Inspired by Duolingo's vibrant, accessible color scheme:

- **Primary (Green)**: `#22c55e` (500) - Main brand color
- **Success**: `#58cc02` - Positive feedback
- **Warning**: `#ff9600` - Caution indicators
- **Error**: `#ff4b4b` - Error states
- **Info**: `#1cb0f6` - Informational content

### Typography

- **Font**: Inter (system fallback to -apple-system, Segoe UI, etc.)
- **Scale**: xs (0.75rem) to 4xl (2.25rem)
- **Font Weights**: Regular (400), Medium (500), Semibold (600), Bold (700)

### Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: ≥ 1024px

All layout components adapt to mobile widths. The `AppShell` includes:
- Desktop: Persistent sidebar navigation
- Mobile: Hamburger menu with slide-in drawer

## 🚀 Getting Started

### Development

```bash
pnpm install
pnpm --filter web dev
```

Visit `http://localhost:3000`

### Testing

```bash
pnpm --filter web test              # Run once
pnpm --filter web test:watch        # Watch mode
pnpm --filter web test:coverage     # With coverage
```

### Building

```bash
pnpm --filter web build
pnpm --filter web preview
```

## 🧩 Core Components

### Layout Components

- **`AppShell`**: Main layout wrapper with sidebar, topbar, and outlet
- **`TopBar`**: Header with navigation trigger, branding, and user stats
- **`SidebarNav`**: Desktop navigation sidebar
- **`MobileNavDrawer`**: Mobile slide-in navigation drawer
- **`ResponsiveGrid`**: Auto-fit grid that adapts to container width
- **`RouteFallback`**: Loading state for lazy-loaded routes

### UI Components

- **`Button`**: Supports variants (primary, secondary, success, warning, ghost) and sizes (sm, md, lg)
- **`Card`**: Content container with elevation levels
- **`ProgressRing`**: Circular progress indicator with animations

### Component Usage

```tsx
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

<Card title="My Card" elevation="soft">
  <Button variant="primary" size="lg" fullWidth>
    Click me
  </Button>
</Card>
```

## 📡 API & State Management

### RTK Query Setup

API endpoints are defined in `src/services/api/`:

```tsx
// services/api/dashboardApi.ts
import { api } from './baseApi';
import type { DashboardSummary } from '../sdk/types';

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<DashboardSummary, void>({
      query: () => '/dashboard',
      transformResponse: (response) => response.data,
      providesTags: ['Dashboard'],
    }),
  }),
});

export const { useGetDashboardQuery } = dashboardApi;
```

### Using API Hooks

```tsx
import { useGetDashboardQuery } from '@/services/api/dashboardApi';

const DashboardPage = () => {
  const { data, isLoading, error } = useGetDashboardQuery();
  // ...
};
```

### Mock Data

Until the backend API is fully implemented, mock data is provided in `src/services/sdk/mockData.ts`. This allows the frontend to develop independently.

## 🔌 Real-time (WebSocket)

### Realtime Client

The `realtimeClient` singleton in `src/services/realtime/realtimeClient.ts` manages WebSocket connections with automatic reconnection.

```tsx
// In App.tsx (already wired up)
useEffect(() => {
  realtimeClient.connect();
  return () => realtimeClient.disconnect();
}, []);
```

### Listening to Events

Create a custom hook:

```tsx
import { useEffect } from 'react';
import { realtimeClient } from '@/services/realtime/realtimeClient';

export const useRealtimeXp = (callback: (data: XpUpdate) => void) => {
  useEffect(() => {
    realtimeClient.on('xp-update', callback);
    return () => realtimeClient.off('xp-update', callback);
  }, [callback]);
};
```

## 🛤️ Adding New Routes

1. Create feature page component in `src/features/[feature]/[Feature]Page.tsx`
2. Register route in `src/app/router.tsx`:

```tsx
const NewFeature = lazy(() => import('@/features/newFeature/NewFeaturePage'));

// Inside <Routes>:
<Route path="/new-feature" element={<NewFeature />} />
```

3. Add navigation link in `src/components/layout/navConfig.ts`:

```tsx
{ label: 'New Feature', path: '/new-feature', icon: Star }
```

## 🎨 Extending the Design System

### Adding a New Button Variant

Edit `src/components/ui/Button.tsx`:

```tsx
type ButtonVariant = 'primary' | 'secondary' | 'danger'; // Add new variant

const variantClasses: Record<ButtonVariant, string> = {
  // ...
  danger: 'bg-red-500 text-white hover:bg-red-600',
};
```

### Adding a New Color

Edit `tailwind.config.js`:

```js
colors: {
  brand: {
    500: '#your-color',
  },
}
```

## 📝 Code Conventions

- Use absolute imports with `@/` prefix (e.g., `@/components/ui/Button`)
- Name components with PascalCase
- Export default from feature page components
- Use named exports for UI components and utilities
- Prefer function components with hooks over class components
- Use TypeScript strict mode (no implicit any)

## 🧪 Testing

Sample test for the Button component:

```tsx
// src/components/ui/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('supports click events', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

## 🔧 Environment Variables

Create `.env` or `.env.local`:

```
VITE_API_URL=http://localhost:5000/api
```

Access in code:

```ts
const apiUrl = import.meta.env.VITE_API_URL;
```

## 📦 Available Scripts

- `pnpm dev` - Start dev server on port 3000
- `pnpm build` - Build production bundle
- `pnpm preview` - Preview production build
- `pnpm test` - Run tests once
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Generate coverage report
- `pnpm typecheck` - Type check without emitting files

## 🚧 Known Limitations

- Mock data is used until backend APIs are fully implemented
- WebSocket events are defined but not yet emitted by the backend
- Authentication flow is stubbed (Auth page doesn't actually authenticate)

## 📚 Further Reading

- [Vite Documentation](https://vitejs.dev/)
- [React Router v6](https://reactrouter.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [RTK Query](https://redux-toolkit.js.org/rtk-query/overview)
- [Tailwind CSS](https://tailwindcss.com/)
- [Socket.io Client](https://socket.io/docs/v4/client-api/)
