import { prisma } from '../config/database';

export interface AttemptResult {
  isCorrect: boolean;
  quality: number;
}

export interface QueueEntry {
  id: string;
  exerciseId: string;
  nextReview: Date;
  interval: number;
  easeFactor: number;
  repetitions: number;
}

export interface SchedulingResult {
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReview: Date;
}

export function calculateNextReview(
  currentInterval: number,
  repetitions: number,
  easeFactor: number,
  quality: number,
): SchedulingResult {
  let newEaseFactor = easeFactor;
  let newInterval = currentInterval;
  let newRepetitions = repetitions;

  if (quality >= 3) {
    newRepetitions += 1;

    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(currentInterval * easeFactor);
    }

    newEaseFactor =
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  } else {
    newRepetitions = 0;
    newInterval = 1;
  }

  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return {
    interval: newInterval,
    easeFactor: newEaseFactor,
    repetitions: newRepetitions,
    nextReview,
  };
}

export class SpacedRepetitionService {
  async addToQueue(userId: string, exerciseId: string): Promise<QueueEntry> {
    const existing = await prisma.spacedRepetitionQueue.findUnique({
      where: {
        userId_exerciseId: {
          userId,
          exerciseId,
        },
      },
    });

    if (existing) {
      return existing;
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + 1);

    const entry = await prisma.spacedRepetitionQueue.create({
      data: {
        userId,
        exerciseId,
        nextReview,
        interval: 1,
        easeFactor: 2.5,
        repetitions: 0,
        isActive: true,
      },
    });

    return entry;
  }

  async updateAfterAttempt(
    userId: string,
    exerciseId: string,
    quality: number,
  ): Promise<QueueEntry> {
    const queueEntry = await prisma.spacedRepetitionQueue.findUnique({
      where: {
        userId_exerciseId: {
          userId,
          exerciseId,
        },
      },
    });

    if (!queueEntry) {
      const newEntry = await this.addToQueue(userId, exerciseId);
      const { interval, easeFactor, repetitions, nextReview } = calculateNextReview(
        newEntry.interval,
        newEntry.repetitions,
        newEntry.easeFactor,
        quality,
      );

      return await prisma.spacedRepetitionQueue.update({
        where: { id: newEntry.id },
        data: {
          interval,
          easeFactor,
          repetitions,
          nextReview,
          updatedAt: new Date(),
        },
      });
    }

    const { interval, easeFactor, repetitions, nextReview } = calculateNextReview(
      queueEntry.interval,
      queueEntry.repetitions,
      queueEntry.easeFactor,
      quality,
    );

    return await prisma.spacedRepetitionQueue.update({
      where: { id: queueEntry.id },
      data: {
        interval,
        easeFactor,
        repetitions,
        nextReview,
        updatedAt: new Date(),
      },
    });
  }

  async getNextExercises(
    userId: string,
    limit: number = 10,
  ): Promise<QueueEntry[]> {
    const now = new Date();

    return await prisma.spacedRepetitionQueue.findMany({
      where: {
        userId,
        isActive: true,
        nextReview: {
          lte: now,
        },
      },
      orderBy: {
        nextReview: 'asc',
      },
      take: limit,
    });
  }

  async getNextExerciseCards(
    userId: string,
    limit: number = 10,
  ) {
    const now = new Date();

    return await prisma.spacedRepetitionQueue.findMany({
      where: {
        userId,
        isActive: true,
        nextReview: {
          lte: now,
        },
      },
      orderBy: {
        nextReview: 'asc',
      },
      take: limit,
      include: {
        exercise: {
          include: {
            lesson: {
              select: {
                id: true,
                title: true,
                moduleId: true,
              },
            },
            prompts: true,
          },
        },
      },
    });
  }

  async getDueExercisesByLesson(
    userId: string,
    lessonId: string,
  ): Promise<QueueEntry[]> {
    const now = new Date();

    const exercises = await prisma.exercise.findMany({
      where: { lessonId },
      select: { id: true },
    });

    const exerciseIds = exercises.map((ex: { id: string }) => ex.id);

    return await prisma.spacedRepetitionQueue.findMany({
      where: {
        userId,
        exerciseId: {
          in: exerciseIds,
        },
        isActive: true,
        nextReview: {
          lte: now,
        },
      },
      orderBy: {
        nextReview: 'asc',
      },
    });
  }

  async getQueueStats(userId: string): Promise<{
    total: number;
    due: number;
    learning: number;
    review: number;
  }> {
    const now = new Date();

    const [total, due, learning, review] = await Promise.all([
      prisma.spacedRepetitionQueue.count({
        where: { userId, isActive: true },
      }),
      prisma.spacedRepetitionQueue.count({
        where: {
          userId,
          isActive: true,
          nextReview: { lte: now },
        },
      }),
      prisma.spacedRepetitionQueue.count({
        where: {
          userId,
          isActive: true,
          repetitions: 0,
        },
      }),
      prisma.spacedRepetitionQueue.count({
        where: {
          userId,
          isActive: true,
          repetitions: { gt: 0 },
        },
      }),
    ]);

    return {
      total,
      due,
      learning,
      review,
    };
  }

  async deactivateExercise(userId: string, exerciseId: string): Promise<void> {
    await prisma.spacedRepetitionQueue.updateMany({
      where: {
        userId,
        exerciseId,
      },
      data: {
        isActive: false,
      },
    });
  }

  async enqueueLessonExercises(userId: string, lessonId: string): Promise<void> {
    const exercises = await prisma.exercise.findMany({
      where: { lessonId },
      select: { id: true },
    });

    await Promise.all(
      exercises.map((exercise) => this.addToQueue(userId, exercise.id)),
    );
  }
}

export const spacedRepetitionService = new SpacedRepetitionService();
