# Lesson Engine API Documentation

## Overview

The Lesson Engine API provides comprehensive course management, progress tracking, and spaced repetition learning capabilities. It supports role-based access control with separate endpoints for administrators and learners.

## Table of Contents

- [Authentication](#authentication)
- [Admin Endpoints](#admin-endpoints)
- [Learner Endpoints](#learner-endpoints)
- [Public Endpoints](#public-endpoints)
- [Spaced Repetition Algorithm](#spaced-repetition-algorithm)
- [Data Models](#data-models)

## Authentication

All protected endpoints require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

### JWT Payload Structure

```json
{
  "userId": "string",
  "email": "string",
  "role": "learner" | "admin"
}
```

### User Roles

- **`learner`**: Can view courses, enroll, complete lessons, and track progress
- **`admin`**: Full access to content management (CRUD operations on all content)

## Admin Endpoints

Base path: `/api/admin/content`

All admin endpoints require authentication and admin role.

### Languages

#### List Languages
```
GET /api/admin/content/languages
```

Response:
```json
{
  "data": [
    {
      "id": "string",
      "code": "string",
      "name": "string",
      "flag": "string",
      "isRtl": boolean,
      "isActive": boolean
    }
  ]
}
```

#### Get Language by ID
```
GET /api/admin/content/languages/:id
```

#### Create Language
```
POST /api/admin/content/languages
Content-Type: application/json

{
  "code": "string",
  "name": "string",
  "flag": "string (optional)",
  "isRtl": boolean (optional)
}
```

#### Update Language
```
PUT /api/admin/content/languages/:id
Content-Type: application/json

{
  "code": "string (optional)",
  "name": "string (optional)",
  "flag": "string (optional)",
  "isRtl": boolean (optional)",
  "isActive": boolean (optional)
}
```

#### Delete Language
```
DELETE /api/admin/content/languages/:id
```

### Courses

#### List Courses
```
GET /api/admin/content/courses?languageId=<id>&isPublished=<true|false>
```

#### Get Course by ID
```
GET /api/admin/content/courses/:id
```

Response includes modules and lessons for published course.

#### Create Course
```
POST /api/admin/content/courses
Content-Type: application/json

{
  "languageId": "string",
  "title": "string",
  "description": "string (optional)",
  "level": "beginner" | "intermediate" | "advanced",
  "imageUrl": "string (optional)",
  "sortOrder": number (optional)
}
```

#### Update Course
```
PUT /api/admin/content/courses/:id
Content-Type: application/json

{
  "title": "string (optional)",
  "description": "string (optional)",
  "level": "string (optional)",
  "imageUrl": "string (optional)",
  "isPublished": boolean (optional),
  "sortOrder": number (optional)
}
```

#### Delete Course
```
DELETE /api/admin/content/courses/:id
```

### Modules

#### List Modules
```
GET /api/admin/content/modules?courseId=<id>
```

#### Get Module by ID
```
GET /api/admin/content/modules/:id
```

#### Create Module
```
POST /api/admin/content/modules
Content-Type: application/json

{
  "courseId": "string",
  "title": "string",
  "description": "string (optional)",
  "sortOrder": number (optional)
}
```

#### Update Module
```
PUT /api/admin/content/modules/:id
Content-Type: application/json

{
  "title": "string (optional)",
  "description": "string (optional)",
  "sortOrder": number (optional)",
  "isPublished": boolean (optional)
}
```

#### Delete Module
```
DELETE /api/admin/content/modules/:id
```

### Lessons

#### List Lessons
```
GET /api/admin/content/lessons?moduleId=<id>
```

#### Get Lesson by ID
```
GET /api/admin/content/lessons/:id
```

Response includes sections, exercises, and prompts.

#### Create Lesson
```
POST /api/admin/content/lessons
Content-Type: application/json

{
  "moduleId": "string",
  "title": "string",
  "description": "string (optional)",
  "type": "reading" | "listening" | "speaking" | "writing" | "grammar" | "vocabulary",
  "sortOrder": number (optional)
}
```

#### Update Lesson
```
PUT /api/admin/content/lessons/:id
Content-Type: application/json

{
  "title": "string (optional)",
  "description": "string (optional)",
  "type": "string (optional)",
  "sortOrder": number (optional)",
  "isPublished": boolean (optional)
}
```

#### Delete Lesson
```
DELETE /api/admin/content/lessons/:id
```

### Lesson Sections

#### Create Lesson Section
```
POST /api/admin/content/lesson-sections
Content-Type: application/json

{
  "lessonId": "string",
  "title": "string",
  "content": {}, // JSON content (rich text, media, etc.)
  "type": "text" | "audio" | "video" | "image" | "interactive",
  "order": number (optional)
}
```

#### Update Lesson Section
```
PUT /api/admin/content/lesson-sections/:id
Content-Type: application/json

{
  "title": "string (optional)",
  "content": {} (optional),
  "type": "string (optional)",
  "order": number (optional)
}
```

#### Delete Lesson Section
```
DELETE /api/admin/content/lesson-sections/:id
```

### Exercises

#### Create Exercise
```
POST /api/admin/content/exercises
Content-Type: application/json

{
  "lessonId": "string",
  "type": "multiple_choice" | "translation" | "fill_blank" | "speaking" | "listening" | "writing",
  "question": {}, // JSON question structure
  "answer": {
    "correctAnswer": "string",
    "alternatives": ["string"] (optional),
    "explanation": "string" (optional)
  },
  "hints": {} (optional),
  "difficulty": "easy" | "medium" | "hard" (optional)",
  "points": number (optional, default: 10),
  "timeLimit": number (optional, in seconds)",
  "sortOrder": number (optional)
}
```

#### Update Exercise
```
PUT /api/admin/content/exercises/:id
Content-Type: application/json

{
  "type": "string (optional)",
  "question": {} (optional),
  "answer": {} (optional),
  "hints": {} (optional),
  "difficulty": "string (optional)",
  "points": number (optional)",
  "timeLimit": number (optional)",
  "sortOrder": number (optional)
}
```

#### Delete Exercise
```
DELETE /api/admin/content/exercises/:id
```

### Exercise Prompts

#### Create Exercise Prompt
```
POST /api/admin/content/exercise-prompts
Content-Type: application/json

{
  "exerciseId": "string",
  "prompt": "string",
  "type": "text" | "audio" | "image",
  "data": {
    "audioUrl": "string (optional)",
    "imageUrl": "string (optional)",
    "alt": "string (optional)"
  } (optional)
}
```

#### Update Exercise Prompt
```
PUT /api/admin/content/exercise-prompts/:id
Content-Type: application/json

{
  "prompt": "string (optional)",
  "type": "string (optional)",
  "data": {} (optional)
}
```

#### Delete Exercise Prompt
```
DELETE /api/admin/content/exercise-prompts/:id
```

## Learner Endpoints

Base path: `/api/learner`

All learner endpoints require authentication and learner (or admin) role.

### Courses

#### List Available Courses
```
GET /api/learner/courses
```

Returns only published courses.

#### Get Course Details
```
GET /api/learner/courses/:id
```

#### Enroll in Course
```
POST /api/learner/courses/:id/enroll
```

Response:
```json
{
  "data": {
    "id": "string",
    "courseId": "string",
    "enrolledAt": "ISO-8601 date",
    "progress": number (0-100)
  }
}
```

#### List User Enrollments
```
GET /api/learner/enrollments
```

#### Get Skill Tree
```
GET /api/learner/courses/:courseId/skill-tree
```

Returns hierarchical structure of modules and lessons with completion status.

Response:
```json
{
  "data": [
    {
      "id": "string",
      "title": "string",
      "type": "module",
      "isLocked": boolean,
      "isCompleted": boolean,
      "progress": number (0-100),
      "sortOrder": number,
      "children": [
        {
          "id": "string",
          "title": "string",
          "type": "lesson",
          "isLocked": boolean,
          "isCompleted": boolean,
          "progress": number,
          "sortOrder": number
        }
      ]
    }
  ]
}
```

### Lessons

#### Get Lesson Content
```
GET /api/learner/lessons/:id/content
```

Returns complete lesson with sections, exercises, and prompts (but not answers).

Response:
```json
{
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "type": "string",
    "sections": [...],
    "exercises": [
      {
        "id": "string",
        "type": "string",
        "question": {},
        "hints": {},
        "difficulty": "string",
        "points": number,
        "timeLimit": number,
        "sortOrder": number,
        "prompts": [...]
      }
    ]
  }
}
```

#### Complete Lesson
```
POST /api/learner/lessons/:id/complete
Content-Type: application/json

{
  "timeSpent": number (in seconds),
  "score": number (0-100)
}
```

Response:
```json
{
  "data": {
    "lessonId": "string",
    "xpEarned": number,
    "streakBonus": boolean,
    "completedAt": "ISO-8601 date"
  }
}
```

XP Calculation:
- Base XP = score * 10
- With 7+ day streak: XP = Base XP * 1.5

### Exercises

#### Submit Exercise Attempt
```
POST /api/learner/exercises/:id/attempt
Content-Type: application/json

{
  "answer": "string" | {},
  "timeSpent": number (in seconds)
}
```

Response:
```json
{
  "data": {
    "id": "string",
    "isCorrect": boolean,
    "score": number,
    "correctAnswer": "string (only if incorrect)"
  }
}
```

Exercise is automatically added/updated in spaced repetition queue.

### Spaced Repetition

#### Get Next Exercises for Review
```
GET /api/learner/spaced-repetition/next?limit=10
```

Returns exercises due for review based on SM-2 algorithm.

#### Get Queue Statistics
```
GET /api/learner/spaced-repetition/stats
```

Response:
```json
{
  "data": {
    "total": number,
    "due": number,
    "learning": number (repetitions = 0),
    "review": number (repetitions > 0)
  }
}
```

### Progress

#### Get Progress Snapshot
```
GET /api/learner/progress?courseId=<id>
```

Response:
```json
{
  "data": {
    "userId": "string",
    "courseId": "string (if specified)",
    "streak": number,
    "accuracy": number (percentage),
    "completionPercentage": number,
    "totalXp": number,
    "lessonsCompleted": number,
    "exercisesCompleted": number,
    "timeSpent": number (in seconds)
  }
}
```

## Public Endpoints

Base path: `/api/content`

No authentication required.

### List Languages
```
GET /api/content/languages
```

### List Published Courses
```
GET /api/content/courses?languageId=<id>
```

### Get Course Details
```
GET /api/content/courses/:id
```

Returns only if course is published.

## Spaced Repetition Algorithm

### SM-2 Algorithm Overview

The system uses the SuperMemo 2 (SM-2) algorithm variant for optimal review scheduling.

### Quality Ratings (0-5)

- **5**: Perfect recall
- **4**: Correct response after hesitation
- **3**: Correct response with difficulty
- **2**: Incorrect response with correct answer remembered
- **1**: Incorrect response with vague memory
- **0**: Complete blackout

The API automatically assigns quality based on correctness:
- Correct answer: quality = 4
- Incorrect answer: quality = 2

### Algorithm Parameters

- **Ease Factor (EF)**: Starting at 2.5, adjusted based on quality
- **Interval**: Days until next review
- **Repetitions**: Successful consecutive reviews

### Scheduling Rules

1. **First repetition**: 1 day
2. **Second repetition**: 6 days
3. **Subsequent repetitions**: Previous interval × EF

For quality < 3:
- Repetitions reset to 0
- Interval reset to 1 day

### Ease Factor Calculation

```
EF' = EF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
```

Minimum EF: 1.3

### Example Review Sequence

Quality 4 (correct):
- Day 0: First attempt (interval = 1 day, EF = 2.5, reps = 0)
- Day 1: Second review (interval = 6 days, EF = 2.36, reps = 1)
- Day 7: Third review (interval = 14 days, EF = 2.36, reps = 2)
- Day 21: Fourth review (interval = 33 days, EF = 2.36, reps = 3)

Quality 2 (incorrect):
- Resets to: interval = 1 day, reps = 0, EF unchanged

## Data Models

### Course Enrollment
```typescript
{
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Date;
  completedAt: Date | null;
  progress: number; // 0-100 percentage
  lastAccessedAt: Date;
}
```

### Progress Snapshot
```typescript
{
  id: string;
  userId: string;
  courseId: string | null;
  lessonId: string | null;
  completedAt: Date;
  timeSpent: number; // seconds
  score: number | null;
  xpEarned: number;
  streakBonus: boolean;
}
```

### Spaced Repetition Queue Entry
```typescript
{
  id: string;
  userId: string;
  exerciseId: string;
  nextReview: Date;
  interval: number; // days
  easeFactor: number; // 1.3 - ~4.0
  repetitions: number;
  isActive: boolean;
}
```

### Exercise Attempt
```typescript
{
  id: string;
  userId: string;
  exerciseId: string;
  answer: JSON;
  isCorrect: boolean;
  score: number;
  timeSpent: number; // seconds
  attempts: number;
  createdAt: Date;
}
```

### XP Transaction
```typescript
{
  id: string;
  userId: string;
  amount: number; // positive or negative
  reason: string; // e.g., "lesson_completed", "exercise_completed", "streak_bonus"
  sourceId: string | null;
  sourceType: string | null; // "lesson", "exercise", "achievement"
  createdAt: Date;
}
```

## Error Responses

All errors follow this structure:

```json
{
  "error": {
    "message": "string",
    "statusCode": number,
    "traceId": "string",
    "timestamp": "ISO-8601 date",
    "path": "string (optional)"
  }
}
```

### Common Status Codes

- **200**: Success
- **201**: Resource created
- **204**: Success with no content
- **400**: Bad request (validation error)
- **401**: Unauthorized (missing or invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Resource not found
- **500**: Internal server error

## Rate Limiting

- Global: 100 requests per 15 minutes per IP
- API routes: 30 requests per minute
- Auth routes: 5 failed attempts per 15 minutes

## Best Practices

1. **Content Publishing Workflow**:
   - Create content with `isPublished: false`
   - Test thoroughly
   - Set appropriate `sortOrder` values
   - Publish when ready: `isPublished: true`

2. **Progress Tracking**:
   - Enroll users before accessing course content
   - Complete lessons in order (skill tree enforces this via locking)
   - Track time accurately for analytics

3. **Spaced Repetition**:
   - Auto-enqueue exercises when first attempted
   - Review due exercises daily for optimal retention
   - Use quality ratings to adjust scheduling

4. **Performance**:
   - Use pagination for large result sets
   - Cache frequently accessed content
   - Monitor XP transactions for leaderboards

## Future Enhancements

- Real-time progress updates via WebSocket
- Advanced analytics dashboard
- Multi-language support for UI
- Adaptive difficulty based on performance
- Social features integration (challenges, leaderboards)
- Achievement system integration
- Content recommendations based on user history
