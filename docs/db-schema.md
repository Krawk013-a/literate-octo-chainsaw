# Database Schema Documentation

## Overview

This document describes the PostgreSQL database schema for the language learning platform. The schema is designed to support users, content management, progress tracking, gamification, and social features.

## Entity Relationship Diagram (ERD)

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│      User       │◄──────┤     Profile       │       │   Preferences   │
├─────────────────┤       ├──────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)          │       │ id (PK)         │
│ email (UNIQUE)  │       │ userId (FK, UNQ) │       │ userId (FK, UNQ)│
│ username (UNIQ) │       │ firstName        │       │ dailyGoalMins   │
│ password        │       │ lastName         │       │ emailNotifs     │
│ createdAt       │       │ avatar           │       │ pushNotifs      │
│ updatedAt       │       │ bio              │       │ darkMode        │
│ deletedAt (SOFT)│       │ timezone         │       │ ...             │
└─────────────────┘       │ language         │       └─────────────────┘
         │                │ createdAt        │               │
         │                │ updatedAt        │               │
         │                └──────────────────┘               │
         │                                                   │
         │                                                   │
         ▼                                                   ▼
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│ ProgressSnapshot│       │  Streak          │       │ XpTransaction   │
├─────────────────┤       ├──────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)          │       │ id (PK)         │
│ userId (FK)      │       │ userId (FK, UNQ) │       │ userId (FK)     │
│ courseId (FK)    │       │ current          │       │ amount          │
│ lessonId (FK)    │       │ longest          │       │ reason          │
│ completedAt     │       │ lastActive       │       │ sourceId        │
│ timeSpent       │       │ createdAt        │       │ sourceType      │
│ score           │       │ updatedAt        │       │ createdAt       │
│ xpEarned        │       └──────────────────┘       └─────────────────┘
│ streakBonus     │               │
└─────────────────┘               │
         │                        │
         │                        │
         ▼                        ▼
┌─────────────────┐       ┌──────────────────┐
│ SpacedRepQueue  │       │ Notification     │
├─────────────────┤       ├──────────────────┤
│ id (PK)         │       │ id (PK)          │
│ userId (FK)      │       │ userId (FK)      │
│ exerciseId (FK)  │       │ type             │
│ nextReview      │       │ title            │
│ interval        │       │ message          │
│ easeFactor      │       │ data (JSON)      │
│ repetitions     │       │ isRead           │
│ isActive        │       │ createdAt        │
│ createdAt       │       └──────────────────┘
│ updatedAt       │
└─────────────────┘

┌─────────────────┐       ┌──────────────────┐
│   Language      │◄──────┤     Course       │
├─────────────────┤       ├──────────────────┤
│ id (PK)         │       │ id (PK)          │
│ code (UNIQUE)   │       │ languageId (FK)  │
│ name (UNIQUE)   │       │ title            │
│ flag            │       │ description      │
│ isRtl           │       │ level            │
│ isActive        │       │ imageUrl         │
│ createdAt       │       │ isPublished      │
│ updatedAt       │       │ sortOrder        │
└─────────────────┘       │ createdAt        │
         │                │ updatedAt        │
         │                └──────────────────┘
         │                         │
         │                         │
         ▼                         ▼
┌─────────────────┐       ┌──────────────────┐
│     Module      │◄──────┤      Lesson      │
├─────────────────┤       ├──────────────────┤
│ id (PK)         │       │ id (PK)          │
│ courseId (FK)    │       │ moduleId (FK)    │
│ title           │       │ title            │
│ description     │       │ description      │
│ sortOrder       │       │ type             │
│ isPublished     │       │ sortOrder        │
│ createdAt       │       │ isPublished      │
│ updatedAt       │       │ createdAt        │
└─────────────────┘       │ updatedAt        │
         │                └──────────────────┘
         │                         │
         │                         │
         ▼                         ▼
┌─────────────────┐       ┌──────────────────┐
│  LessonSection  │◄──────┤     Exercise     │
├─────────────────┤       ├──────────────────┤
│ id (PK)         │       │ id (PK)          │
│ lessonId (FK)    │       │ lessonId (FK)    │
│ title           │       │ type             │
│ content (JSON)  │       │ question (JSON)  │
│ type            │       │ answer (JSON)     │
│ order           │       │ difficulty       │
│ createdAt       │       │ points           │
│ updatedAt       │       │ timeLimit        │
└─────────────────┘       │ sortOrder        │
         │                │ createdAt        │
         │                │ updatedAt        │
         │                └──────────────────┘
         │                         │
         │                         │
         ▼                         ▼
┌─────────────────┐       ┌──────────────────┐
│ ExercisePrompt  │◄──────┤ ExerciseAttempt  │
├─────────────────┤       ├──────────────────┤
│ id (PK)         │       │ id (PK)          │
│ exerciseId (FK)  │       │ userId (FK)      │
│ prompt          │       │ exerciseId (FK)  │
│ type            │       │ answer (JSON)     │
│ data (JSON)     │       │ isCorrect        │
│ createdAt       │       │ score            │
│ updatedAt       │       │ timeSpent        │
└─────────────────┘       │ attempts         │
         │                │ createdAt        │
         │                └──────────────────┘
         │
         ▼
┌─────────────────┐
│  Achievement    │◄──────┐
├─────────────────┤       │
│ id (PK)         │       │
│ name (UNIQUE)   │       │
│ description     │       │
│ icon            │       │
│ badgeColor      │       │
│ xpReward        │       │
│ condition (JSON)│       │
│ isActive        │       │
│ sortOrder       │       │
│ createdAt       │       │
│ updatedAt       │       │
└─────────────────┘       │
         │                │
         │                │
         ▼                ▼
┌─────────────────┐       ┌──────────────────┐
│ UserAchievement │       │     Challenge    │
├─────────────────┤       ├──────────────────┤
│ id (PK)         │       │ id (PK)          │
│ userId (FK)      │       │ creatorId (FK)   │
│ achievementId(FK)│       │ title            │
│ unlockedAt      │       │ description      │
│ progress (JSON) │       │ type             │
└─────────────────┘       │ targetValue      │
         │                │ startDate        │
         │                │ endDate          │
         │                │ isActive         │
         │                │ maxParticipants  │
         │                │ createdAt        │
         │                │ updatedAt        │
         │                └──────────────────┘
         │                         │
         │                         │
         ▼                         ▼
┌─────────────────┐       ┌──────────────────┐
│   Friendship   │       │   Leaderboard    │
├─────────────────┤       ├──────────────────┤
│ id (PK)         │       │ id (PK)          │
│ user1Id (FK)     │       │ name (UNIQUE)    │
│ user2Id (FK)     │       │ description      │
│ status          │       │ type             │
│ initiatedBy     │       │ courseId (FK)    │
│ createdAt       │       │ isActive         │
│ updatedAt       │       │ resetPeriod      │
└─────────────────┘       │ createdAt        │
         │                │ updatedAt        │
         │                └──────────────────┘
         │
         │
         ▼
┌─────────────────┐
│ ChallengeUsers  │ (Many-to-Many)
├─────────────────┤
│ challengeId (FK)│
│ userId (FK)     │
│ joinedAt        │
└─────────────────┘
```

## Core Tables

### User Management

#### `users`
Core user authentication and identity management.
- **Purpose**: Store user accounts and authentication credentials
- **Key Fields**: email, username, password (hashed), soft delete support
- **Indexes**: email, username (unique)
- **Relationships**: One-to-one with profile, preferences, streak

#### `profiles`
Extended user profile information.
- **Purpose**: Store user demographic and preference data
- **Key Fields**: firstName, lastName, avatar, bio, timezone, language
- **Relationships**: Belongs to user

#### `preferences`
User application preferences and settings.
- **Purpose**: Store user-specific app settings
- **Key Fields**: dailyGoalMinutes, notification preferences, UI settings
- **Relationships**: Belongs to user

### Content Management

#### `languages`
Available languages for learning.
- **Purpose**: Define supported languages
- **Key Fields**: code (ISO), name, flag, RTL support
- **Indexes**: code, name (unique)

#### `courses`
Language learning courses.
- **Purpose**: Organize learning content by language and level
- **Key Fields**: title, description, level, publication status
- **Relationships**: Belongs to language, has modules

#### `modules`
Course subdivisions.
- **Purpose**: Organize lessons within courses
- **Key Fields**: title, description, order, publication status
- **Relationships**: Belongs to course, has lessons

#### `lessons`
Individual learning units.
- **Purpose**: Define specific learning activities
- **Key Fields**: title, type (reading, speaking, etc.), order
- **Relationships**: Belongs to module, has sections and exercises

#### `lesson_sections`
Content within lessons.
- **Purpose**: Store rich content (text, audio, video, interactive)
- **Key Fields**: title, content (JSON), type, order
- **Relationships**: Belongs to lesson

### Exercise System

#### `exercises`
Learning exercises and assessments.
- **Purpose**: Define interactive learning activities
- **Key Fields**: type, question (JSON), answer (JSON), difficulty, points
- **Relationships**: Belongs to lesson, has prompts and attempts

#### `exercise_prompts`
Exercise content and media.
- **Purpose**: Store exercise prompts (text, audio, images)
- **Key Fields**: prompt, type, data (JSON)
- **Relationships**: Belongs to exercise

#### `exercise_attempts`
User exercise submissions.
- **Purpose**: Track user performance on exercises
- **Key Fields**: answer (JSON), isCorrect, score, timeSpent
- **Relationships**: Belongs to user and exercise
- **Indexes**: userId, exerciseId, createdAt

### Progress Tracking

#### `progress_snapshots`
User learning progress records.
- **Purpose**: Track completion of lessons/courses
- **Key Fields**: courseId, lessonId, timeSpent, score, xpEarned
- **Relationships**: Belongs to user, course, lesson
- **Indexes**: userId, completedAt

#### `spaced_repetition_queue`
Spaced repetition scheduling.
- **Purpose**: Implement SM-2 algorithm for review scheduling
- **Key Fields**: nextReview, interval, easeFactor, repetitions
- **Relationships**: Belongs to user
- **Indexes**: userId, nextReview, isActive

### Gamification

#### `streaks`
User learning streaks.
- **Purpose**: Track consecutive days of activity
- **Key Fields**: current, longest, lastActive
- **Relationships**: Belongs to user

#### `xp_transactions`
Experience point transactions.
- **Purpose**: Track XP gains and losses
- **Key Fields**: amount, reason, sourceId, sourceType
- **Relationships**: Belongs to user
- **Indexes**: userId, createdAt

#### `achievements`
Achievement definitions.
- **Purpose**: Define unlockable achievements
- **Key Fields**: name, description, condition (JSON), xpReward
- **Indexes**: isActive, sortOrder

#### `user_achievements`
User achievement progress.
- **Purpose**: Track unlocked achievements
- **Key Fields**: unlockedAt, progress (JSON)
- **Relationships**: Belongs to user and achievement
- **Indexes**: userId, achievementId (unique)

#### `leaderboards`
Competitive leaderboards.
- **Purpose**: Rank users by various metrics
- **Key Fields**: name, type, courseId, resetPeriod
- **Indexes**: type, isActive, courseId

### Social Features

#### `friendships`
User relationships.
- **Purpose**: Manage friend connections
- **Key Fields**: user1Id, user2Id, status, initiatedBy
- **Indexes**: user1Id, user2Id (unique), status

#### `challenges`
User-created challenges.
- **Purpose**: Organize competitions and goals
- **Key Fields**: title, type, targetValue, dates, maxParticipants
- **Relationships**: Belongs to creator, has participants

#### `notifications`
User notifications.
- **Purpose**: Deliver system and social notifications
- **Key Fields**: type, title, message, data (JSON), isRead
- **Relationships**: Belongs to user
- **Indexes**: userId, isRead, createdAt

## Key Design Decisions

### 1. Soft Deletes
- Users table includes `deletedAt` for soft deletion
- Preserves data integrity for historical records
- Allows recovery of accidentally deleted accounts

### 2. JSON Fields
- Flexible content storage for lessons, exercises, and notifications
- Enables complex data structures without schema migrations
- Used for: lesson content, exercise questions/answers, achievement conditions

### 3. Cascade Rules
- Most relationships use `onDelete: Cascade` for data consistency
- Progress snapshots use `SetNull` to preserve historical data
- Prevents orphaned records while maintaining referential integrity

### 4. Indexing Strategy
- Foreign keys indexed for join performance
- User-centric queries optimized (userId, createdAt)
- Unique constraints on business-critical fields (email, username)

### 5. Audit Fields
- `createdAt` and `updatedAt` on all tables for tracking
- `deletedAt` for soft deletion audit trail
- Timestamps use UTC for consistency

## Performance Considerations

### Frequent Queries
1. **User Progress**: `userId + completedAt` index on progress_snapshots
2. **Notifications**: `userId + isRead` index for notification queries
3. **Exercise Attempts**: `userId + createdAt` for performance tracking
4. **Spaced Repetition**: `userId + nextReview + isActive` for daily reviews

### Scaling Recommendations
1. **Partitioning**: Consider time-based partitioning for large tables (progress_snapshots, exercise_attempts)
2. **Archiving**: Implement archival policies for old notifications and progress data
3. **Caching**: Cache frequently accessed data (user preferences, achievements)
4. **Read Replicas**: Use read replicas for reporting and analytics

## Future Extensions

### Planned Enhancements
1. **Content Versioning**: Add versioning to courses/modules/lessons for A/B testing
2. **Analytics Tables**: Dedicated tables for learning analytics and insights
3. **Subscription Management**: Tables for premium features and billing
4. **Content Ratings**: User feedback and rating system for content
5. **Study Groups**: Collaborative learning features
6. **AI-Powered Features**: Tables for AI tutoring and personalized recommendations

### Migration Strategy
1. Use Prisma migrations for schema changes
2. Implement feature flags for new functionality
3. Maintain backward compatibility during transitions
4. Use blue-green deployments for zero-downtime updates

## Security Considerations

### Data Protection
1. **Password Hashing**: Use bcrypt for secure password storage
2. **PII Handling**: Encrypt sensitive personal information
3. **Audit Logging**: Track data access and modifications
4. **Input Validation**: Validate all data at database and application level

### Access Control
1. **Row-Level Security**: Implement RLS for multi-tenant data isolation
2. **API Rate Limiting**: Prevent abuse through database-level constraints
3. **Data Retention**: Implement policies for data cleanup and GDPR compliance

## Seed Data

The database includes comprehensive seed data for:
- 10 languages (English, Spanish, French, German, Italian, Portuguese, Arabic, Japanese, Korean, Chinese)
- Demo Spanish course with 3 modules and 4 lessons
- Sample exercises of various types (multiple choice, translation, fill-in-blank)
- Achievement system with starter achievements
- Demo user with sample progress and XP
- Leaderboards for competition tracking

This seed data provides a complete foundation for development, testing, and demonstrations.