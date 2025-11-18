# Literate Octo Chainsaw

A production-ready monorepo housing a React+TypeScript frontend and Node.js/Express backend with shared tooling.

## 📦 Project Structure

```
literate-octo-chainsaw/
├── apps/
│   ├── web/                    # React + TypeScript frontend (Vite)
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── test/
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   └── api/                    # Express + TypeScript backend
│       ├── src/
│       │   └── index.ts
│       ├── package.json
│       ├── tsconfig.json
│       └── vitest.config.ts
├── tsconfig.json               # Base TypeScript config
├── .eslintrc.json              # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── pnpm-workspace.yaml         # pnpm workspace definition
└── package.json                # Root package with shared scripts
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0 (Install with `npm install -g pnpm`)

### Installation

```bash
pnpm install
```

This will install all dependencies for the root workspace and all apps.

### Development

Start both the frontend and backend in development mode:

```bash
pnpm dev
```

This will:

- Start the React dev server on `http://localhost:3000` (web)
- Start the Express API server on `http://localhost:5000` (api)

#### Run apps individually:

```bash
# Frontend only
pnpm --filter web dev

# Backend only
pnpm --filter api dev
```

## 🧪 Testing

### Run all tests

```bash
pnpm test
```

### Run tests with coverage

```bash
pnpm test:coverage
```

### Run tests for specific app

```bash
# Frontend tests
pnpm --filter web test

# Backend tests
pnpm --filter api test
```

### Watch mode

```bash
# Frontend
pnpm --filter web test:watch

# Backend
pnpm --filter api test:watch
```

## 🏗️ Building

### Build all apps

```bash
pnpm build
```

This builds the API first (for any shared types), then the web app.

### Build specific app

```bash
# Frontend
pnpm --filter web build

# Backend
pnpm --filter api build
```

### Preview production build (frontend)

```bash
pnpm --filter web preview
```

## 🔍 Code Quality

### Linting

```bash
# Check for linting errors
pnpm lint

# Fix linting errors automatically
pnpm lint:fix
```

### Formatting

```bash
# Check formatting
pnpm format:check

# Fix formatting
pnpm format
```

### Type Checking

```bash
# Type check all packages
pnpm typecheck
```

## 📝 Tech Stack

### Frontend (`apps/web`)

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Vitest** - Unit testing
- **Testing Library** - React component testing

### Backend (`apps/api`)

- **Express** - Web framework
- **TypeScript** - Type safety
- **tsx** - TypeScript execution for development
- **Vitest** - Unit testing
- **Supertest** - API testing

### Shared Tooling

- **pnpm** - Package manager with workspace support
- **ESLint** - Code linting (with React, TypeScript, and accessibility plugins)
- **Prettier** - Code formatting
- **TypeScript** - Shared base configuration

## 🌟 Adding New Packages

### Create a new workspace package

1. Create a new directory under `apps/` or create a `packages/` directory for shared libraries
2. Add a `package.json` with a unique name
3. Update `pnpm-workspace.yaml` if you create new top-level directories

### Install dependencies

```bash
# Add to specific workspace
pnpm --filter <package-name> add <dependency>

# Add dev dependency
pnpm --filter <package-name> add -D <dependency>

# Add to root (shared tooling)
pnpm add -w <dependency>
```

### Example: Add axios to web app

```bash
pnpm --filter web add axios
```

## 📚 Available Scripts

### Root Level

- `pnpm dev` - Start both apps in development mode
- `pnpm build` - Build all apps
- `pnpm test` - Run all tests
- `pnpm test:coverage` - Run tests with coverage
- `pnpm lint` - Lint all code
- `pnpm lint:fix` - Fix linting errors
- `pnpm format` - Format all code
- `pnpm format:check` - Check code formatting
- `pnpm typecheck` - Type check all packages

### Per Package

- `pnpm --filter <package-name> <script>` - Run script in specific package
- `pnpm -r <script>` - Run script in all packages (recursive)

## 🤝 Contributing

1. Follow the existing code style (enforced by ESLint and Prettier)
2. Write tests for new features
3. Ensure all checks pass before committing:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   ```
4. Use conventional commit messages

## 📄 License

MIT
