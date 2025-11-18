import { prisma } from '../config/database';
import { AppError } from '../utils/error';
import { spacedRepetitionService } from './spaced-repetition.service';

export interface EnrollmentResult {
  id: string;
  courseId: string;
  enrolledAt: Date;
  progress: number;
}

export interface SkillTreeNode {
  id: string;
  title: string;
  type: 'module' | 'lesson';
  isLocked: boolean;
  isCompleted: boolean;
  progress: number;
  sortOrder: number;
  children?: SkillTreeNode[];
}

export interface LessonCompletion {
  lessonId: string;
  xpEarned: number;
  streakBonus: boolean;
  completedAt: Date;
}

export interface ProgressSnapshot {
  userId: string;
  courseId?: string;
  streak: number;
  accuracy: number;
  completionPercentage: number;
  totalXp: number;
  lessonsCompleted: number;
  exercisesCompleted: number;
  timeSpent: number;
}

export class ProgressService {
  async enrollInCourse(
    userId: string,
    courseId: string,
  ): Promise<EnrollmentResult> {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new AppError(404, 'Course not found');
    }

    if (!course.isPublished) {
      throw new AppError(400, 'Course is not published');
    }

    const existingEnrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return existingEnrollment;
    }

    const enrollment = await prisma.courseEnrollment.create({
      data: {
        userId,
        courseId,
      },
    });

    return enrollment;
  }

  async getSkillTree(userId: string, courseId: string): Promise<SkillTreeNode[]> {
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      throw new AppError(404, 'Not enrolled in this course');
    }

    const modules = await prisma.module.findMany({
      where: {
        courseId,
        isPublished: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
      include: {
        lessons: {
          where: {
            isPublished: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });

    const completedLessons = await prisma.progressSnapshot.findMany({
      where: {
        userId,
        courseId,
        lessonId: { not: null },
      },
      select: {
        lessonId: true,
      },
      distinct: ['lessonId'],
    });

    const completedLessonIds = new Set(
      completedLessons.map((l: { lessonId: string | null }) => l.lessonId).filter((id): id is string => id !== null),
    );

    const skillTree: SkillTreeNode[] = [];
    let previousModuleCompleted = true;

    for (const module of modules) {
      const moduleLessons = module.lessons;
      const completedCount = moduleLessons.filter((lesson) => completedLessonIds.has(lesson.id)).length;
      const moduleProgress = moduleLessons.length > 0
        ? (completedCount / moduleLessons.length) * 100
        : 0;
      const isModuleCompleted = moduleProgress === 100;

      const lessonNodes: SkillTreeNode[] = [];
      let previousLessonCompleted = previousModuleCompleted;

      for (const lesson of moduleLessons) {
        const isCompleted = completedLessonIds.has(lesson.id);
        lessonNodes.push({
          id: lesson.id,
          title: lesson.title,
          type: 'lesson',
          isLocked: !previousLessonCompleted,
          isCompleted,
          progress: isCompleted ? 100 : 0,
          sortOrder: lesson.sortOrder,
        });
        previousLessonCompleted = isCompleted;
      }

      skillTree.push({
        id: module.id,
        title: module.title,
        type: 'module',
        isLocked: !previousModuleCompleted,
        isCompleted: isModuleCompleted,
        progress: moduleProgress,
        sortOrder: module.sortOrder,
        children: lessonNodes,
      });

      previousModuleCompleted = isModuleCompleted;
    }

    return skillTree;
  }

  async completeLesson(
    userId: string,
    lessonId: string,
    timeSpent: number,
    score: number,
  ): Promise<LessonCompletion> {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new AppError(404, 'Lesson not found');
    }

    const courseId = lesson.module.courseId;

    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      throw new AppError(400, 'Not enrolled in this course');
    }

    const existingCompletion = await prisma.progressSnapshot.findFirst({
      where: {
        userId,
        lessonId,
      },
    });

    if (existingCompletion) {
      throw new AppError(400, 'Lesson already completed');
    }

    const lessonExercises = await prisma.exercise.findMany({
      where: { lessonId },
      select: {
        id: true,
        points: true,
      },
    });

    const totalPoints = lessonExercises.reduce((sum, exercise) => sum + exercise.points, 0);
    const baseXp = Math.max(10, Math.round((score / 100) * (totalPoints || 20)));

    const streak = await prisma.streak.findUnique({
      where: { userId },
    });

    const streakBonus = streak && streak.current >= 7;
    const xpEarned = streakBonus ? Math.round(baseXp * 1.5) : baseXp;

    const completedAt = new Date();

    await prisma.$transaction([
      prisma.progressSnapshot.create({
        data: {
          userId,
          courseId,
          lessonId,
          timeSpent,
          score,
          xpEarned,
          streakBonus,
          completedAt,
        },
      }),
      prisma.xpTransaction.create({
        data: {
          userId,
          amount: xpEarned,
          reason: 'lesson_completed',
          sourceId: lessonId,
          sourceType: 'lesson',
        },
      }),
    ]);

    await spacedRepetitionService.enqueueLessonExercises(userId, lessonId);

    await this.updateCourseProgress(userId, courseId);

    if (streak) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastActive = new Date(streak.lastActive);
      lastActive.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor(
        (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysDiff === 1) {
        await prisma.streak.update({
          where: { userId },
          data: {
            current: streak.current + 1,
            longest: Math.max(streak.longest, streak.current + 1),
            lastActive: new Date(),
          },
        });
      } else if (daysDiff === 0) {
        await prisma.streak.update({
          where: { userId },
          data: {
            lastActive: new Date(),
          },
        });
      } else {
        await prisma.streak.update({
          where: { userId },
          data: {
            current: 1,
            lastActive: new Date(),
          },
        });
      }
    } else {
      await prisma.streak.create({
        data: {
          userId,
          current: 1,
          longest: 1,
          lastActive: new Date(),
        },
      });
    }

    return {
      lessonId,
      xpEarned,
      streakBonus,
      completedAt,
    };
  }

  private async updateCourseProgress(userId: string, courseId: string): Promise<void> {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: {
              where: { isPublished: true },
            },
          },
        },
      },
    });

    if (!course) return;

    const totalLessons = course.modules.reduce(
      (sum: number, mod) => sum + mod.lessons.length,
      0,
    );

    if (totalLessons === 0) return;

    const completedSnapshots = await prisma.progressSnapshot.findMany({
      where: {
        userId,
        courseId,
        lessonId: { not: null },
      },
      select: { lessonId: true },
      distinct: ['lessonId'],
    });

    const progress = (completedSnapshots.length / totalLessons) * 100;

    await prisma.courseEnrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      data: {
        progress,
        lastAccessedAt: new Date(),
        completedAt: progress === 100 ? new Date() : null,
      },
    });
  }

  async getProgressSnapshot(
    userId: string,
    courseId?: string,
  ): Promise<ProgressSnapshot> {
    const [
      streak,
      totalXpResult,
      completedLessonsCount,
      exerciseAttempts,
      totalTimeSpent,
    ] = await Promise.all([
      prisma.streak.findUnique({
        where: { userId },
      }),
      prisma.xpTransaction.aggregate({
        where: { userId },
        _sum: { amount: true },
      }),
      prisma.progressSnapshot.findMany({
        where: {
          userId,
          ...(courseId && { courseId }),
          lessonId: { not: null },
        },
        select: { lessonId: true },
        distinct: ['lessonId'],
      }),
      prisma.exerciseAttempt.findMany({
        where: {
          userId,
          ...(courseId && {
            exercise: {
              lesson: {
                module: {
                  courseId,
                },
              },
            },
          }),
        },
      }),
      prisma.progressSnapshot.aggregate({
        where: {
          userId,
          ...(courseId && { courseId }),
        },
        _sum: { timeSpent: true },
      }),
    ]);

    const correctAttempts = exerciseAttempts.filter(
      (attempt: (typeof exerciseAttempts)[number]) => attempt.isCorrect,
    ).length;
    const accuracy = exerciseAttempts.length > 0
      ? (correctAttempts / exerciseAttempts.length) * 100
      : 0;

    let completionPercentage = 0;
    if (courseId) {
      const enrollment = await prisma.courseEnrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
      });
      completionPercentage = enrollment?.progress || 0;
    }

    return {
      userId,
      courseId,
      streak: streak?.current || 0,
      accuracy: Math.round(accuracy * 10) / 10,
      completionPercentage: Math.round(completionPercentage * 10) / 10,
      totalXp: totalXpResult._sum.amount || 0,
      lessonsCompleted: completedLessonsCount.length,
      exercisesCompleted: exerciseAttempts.length,
      timeSpent: totalTimeSpent._sum.timeSpent || 0,
    };
  }

  async getUserEnrollments(userId: string) {
    return await prisma.courseEnrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            language: true,
          },
        },
      },
      orderBy: {
        lastAccessedAt: 'desc',
      },
    });
  }
}

export const progressService = new ProgressService();
