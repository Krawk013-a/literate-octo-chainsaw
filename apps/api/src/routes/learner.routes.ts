import { Router, Response, NextFunction } from 'express';
import { progressService } from '../services/progress.service';
import { contentService } from '../services/content.service';
import { spacedRepetitionService } from '../services/spaced-repetition.service';
import { authenticate, requireLearner, AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import { AppError } from '../utils/error';

const router = Router();

function requireParam(value: string | undefined, name: string): string {
  if (!value) {
    throw new AppError(400, `${name} is required`);
  }
  return value;
}

router.use(authenticate);
router.use(requireLearner);

router.get('/courses', async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const courses = await contentService.getCourses(undefined, true);
    res.json({ data: courses });
  } catch (error) {
    next(error);
  }
});

router.get('/courses/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const course = await contentService.getCourseById(requireParam(req.params.id, "id"));
    if (!course.isPublished) {
      throw new AppError(404, 'Course not found');
    }
    res.json({ data: course });
  } catch (error) {
    next(error);
  }
});

router.post('/courses/:id/enroll', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const enrollment = await progressService.enrollInCourse(
      req.user!.userId,
      requireParam(req.params.id, 'id'),
    );
    res.status(201).json({ data: enrollment });
  } catch (error) {
    next(error);
  }
});

router.get('/enrollments', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const enrollments = await progressService.getUserEnrollments(req.user!.userId);
    res.json({ data: enrollments });
  } catch (error) {
    next(error);
  }
});

router.get('/courses/:courseId/skill-tree', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const skillTree = await progressService.getSkillTree(
      req.user!.userId,
      requireParam(req.params.courseId, 'courseId'),
    );
    res.json({ data: skillTree });
  } catch (error) {
    next(error);
  }
});

router.get('/lessons/:id/content', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const content = await contentService.getLessonContent(requireParam(req.params.id, "id"));
    res.json({ data: content });
  } catch (error) {
    next(error);
  }
});

router.post('/lessons/:id/complete', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { timeSpent, score } = req.body;
    
    if (typeof timeSpent !== 'number' || timeSpent < 0) {
      throw new AppError(400, 'Valid timeSpent (seconds) is required');
    }
    
    if (typeof score !== 'number' || score < 0 || score > 100) {
      throw new AppError(400, 'Valid score (0-100) is required');
    }

    const completion = await progressService.completeLesson(
      req.user!.userId,
      requireParam(req.params.id, 'id'),
      timeSpent,
      score,
    );
    res.json({ data: completion });
  } catch (error) {
    next(error);
  }
});

router.post('/exercises/:id/attempt', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { answer, timeSpent } = req.body;
    const exerciseId = requireParam(req.params.id, 'id');

    if (!answer || typeof timeSpent !== 'number') {
      throw new AppError(400, 'answer and timeSpent are required');
    }

    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new AppError(404, 'Exercise not found');
    }

    const correctAnswer = exercise.answer as { correctAnswer: string; alternatives?: string[] };
    const userAnswer = typeof answer === 'string' ? answer.trim().toLowerCase() : '';
    const correct = correctAnswer.correctAnswer.toLowerCase();
    const alternatives = (correctAnswer.alternatives || []).map((a: string) => a.toLowerCase());

    const isCorrect = userAnswer === correct || alternatives.includes(userAnswer);
    const score = isCorrect ? exercise.points : 0;

    const quality = isCorrect ? 4 : 2;

    const [attempt] = await Promise.all([
      prisma.exerciseAttempt.create({
        data: {
          userId: req.user!.userId,
          exerciseId,
          answer,
          isCorrect,
          score,
          timeSpent,
        },
      }),
      spacedRepetitionService.updateAfterAttempt(
        req.user!.userId,
        exerciseId,
        quality,
      ),
    ]);

    if (isCorrect) {
      await prisma.xpTransaction.create({
        data: {
          userId: req.user!.userId,
          amount: score,
          reason: 'exercise_completed',
          sourceId: exerciseId,
          sourceType: 'exercise',
        },
      });
    }

    res.json({
      data: {
        id: attempt.id,
        isCorrect,
        score,
        correctAnswer: !isCorrect ? correctAnswer.correctAnswer : undefined,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/spaced-repetition/next', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const exercises = await spacedRepetitionService.getNextExercises(
      req.user!.userId,
      limit,
    );
    res.json({ data: exercises });
  } catch (error) {
    next(error);
  }
});

router.get('/spaced-repetition/stats', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await spacedRepetitionService.getQueueStats(req.user!.userId);
    res.json({ data: stats });
  } catch (error) {
    next(error);
  }
});

router.get('/progress', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const courseId = req.query.courseId as string | undefined;
    const snapshot = await progressService.getProgressSnapshot(
      req.user!.userId,
      courseId,
    );
    res.json({ data: snapshot });
  } catch (error) {
    next(error);
  }
});

export default router;
