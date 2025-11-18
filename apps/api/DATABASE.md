# Database Setup Guide

This guide explains how to set up and manage the database for the language learning platform.

## Prerequisites

- Node.js 18+
- PostgreSQL (for production) or Docker (for development)
- pnpm package manager

## Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Configure your database connection in `.env`:
   - **Production**: Use PostgreSQL connection string
   - **Development**: Use Prisma's local dev server or PostgreSQL

## Database Setup Options

### Option 1: PostgreSQL (Recommended)

1. Install PostgreSQL locally or use a cloud provider
2. Create a database:
   ```sql
   CREATE DATABASE language_learning_db;
   ```
3. Update `.env` with your connection string:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/language_learning_db"
   ```

### Option 2: Prisma Dev Server (Local Development)

1. Start the Prisma development server:
   ```bash
   npx prisma dev
   ```
2. Update `.env` to use the dev server URL (commented by default)

## Database Operations

### Generate Prisma Client
```bash
pnpm db:generate
```

### Create Initial Migration
```bash
pnpm db:migrate --name init
```

### Push Schema Changes (Development)
```bash
pnpm db:push
```

### Reset Database
```bash
pnpm db:reset
```

### Seed Database
```bash
pnpm db:seed
```

### View Database
```bash
pnpm db:studio
```

## Schema Overview

The database consists of the following main entity groups:

### Core Entities
- `users` - User accounts and authentication
- `profiles` - Extended user information
- `preferences` - User app settings

### Content Management
- `languages` - Available learning languages
- `courses` - Language learning courses
- `modules` - Course subdivisions
- `lessons` - Individual learning units
- `lesson_sections` - Lesson content

### Exercise System
- `exercises` - Learning activities
- `exercise_prompts` - Exercise content
- `exercise_attempts` - User submissions

### Progress Tracking
- `progress_snapshots` - Learning progress records
- `spaced_repetition_queue` - Review scheduling

### Gamification
- `streaks` - Learning streaks
- `xp_transactions` - Experience points
- `achievements` - Unlockable achievements
- `user_achievements` - User achievement progress
- `leaderboards` - Competitive rankings

### Social Features
- `friendships` - User relationships
- `challenges` - User competitions
- `notifications` - System messages

## Seed Data

The seed script creates:
- 10 languages (English, Spanish, French, German, Italian, Portuguese, Arabic, Japanese, Korean, Chinese)
- Demo Spanish course with 3 modules and 4 lessons
- Sample exercises of various types
- Achievement system with starter achievements
- Demo user with sample progress

## Development Workflow

1. Make schema changes in `prisma/schema.prisma`
2. Generate client: `pnpm db:generate`
3. Apply changes: `pnpm db:push` (dev) or `pnpm db:migrate` (prod)
4. Update seed data if needed
5. Test with `pnpm db:seed`

## Production Deployment

1. Use PostgreSQL with connection pooling
2. Set up read replicas for analytics
3. Configure automated backups
4. Set up monitoring and alerts
5. Use environment variables for all credentials

## Troubleshooting

### Connection Issues
- Verify database server is running
- Check connection string format
- Ensure database exists
- Verify network connectivity

### Migration Issues
- Check for schema conflicts
- Ensure database is in clean state
- Review migration SQL before applying

### Performance Issues
- Add indexes for frequent queries
- Consider partitioning large tables
- Implement caching strategies
- Monitor query performance

## Security Considerations

- Use environment variables for credentials
- Implement row-level security for multi-tenancy
- Regular security updates for PostgreSQL
- Audit logging for sensitive operations
- Backup encryption and secure storage