import { Router, Response, NextFunction } from 'express';
import { contentService } from '../services/content.service';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/error';

const router = Router();

function requireParam(value: string | undefined, name: string): string {
  if (!value) {
    throw new AppError(400, `${name} is required`);
  }
  return value;
}

router.use(authenticate);
router.use(requireAdmin);

router.get('/languages', async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const languages = await contentService.getLanguages();
    res.json({ data: languages });
  } catch (error) {
    next(error);
  }
});

router.get('/languages/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const language = await contentService.getLanguageById(requireParam(req.params.id, 'id'));
    res.json({ data: language });
  } catch (error) {
    next(error);
  }
});

router.post('/languages', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const language = await contentService.createLanguage(req.body);
    res.status(201).json({ data: language });
  } catch (error) {
    next(error);
  }
});

router.put('/languages/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const language = await contentService.updateLanguage(requireParam(req.params.id, 'id'), req.body);
    res.json({ data: language });
  } catch (error) {
    next(error);
  }
});

router.delete('/languages/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await contentService.deleteLanguage(requireParam(req.params.id, "id"));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get('/courses', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { languageId, isPublished } = req.query;
    const courses = await contentService.getCourses(
      languageId as string | undefined,
      isPublished === 'true' ? true : isPublished === 'false' ? false : undefined,
    );
    res.json({ data: courses });
  } catch (error) {
    next(error);
  }
});

router.get('/courses/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const course = await contentService.getCourseById(requireParam(req.params.id, "id"));
    res.json({ data: course });
  } catch (error) {
    next(error);
  }
});

router.post('/courses', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const course = await contentService.createCourse(req.body);
    res.status(201).json({ data: course });
  } catch (error) {
    next(error);
  }
});

router.put('/courses/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const course = await contentService.updateCourse(requireParam(req.params.id, "id"), req.body);
    res.json({ data: course });
  } catch (error) {
    next(error);
  }
});

router.delete('/courses/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await contentService.deleteCourse(requireParam(req.params.id, "id"));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get('/modules', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.query;
    if (!courseId) {
      return res.status(400).json({ error: { message: 'courseId is required' } });
    }
    const modules = await contentService.getModules(courseId as string);
    res.json({ data: modules });
  } catch (error) {
    next(error);
  }
});

router.get('/modules/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const module = await contentService.getModuleById(requireParam(req.params.id, "id"));
    res.json({ data: module });
  } catch (error) {
    next(error);
  }
});

router.post('/modules', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const module = await contentService.createModule(req.body);
    res.status(201).json({ data: module });
  } catch (error) {
    next(error);
  }
});

router.put('/modules/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const module = await contentService.updateModule(requireParam(req.params.id, "id"), req.body);
    res.json({ data: module });
  } catch (error) {
    next(error);
  }
});

router.delete('/modules/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await contentService.deleteModule(requireParam(req.params.id, "id"));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get('/lessons', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { moduleId } = req.query;
    if (!moduleId) {
      return res.status(400).json({ error: { message: 'moduleId is required' } });
    }
    const lessons = await contentService.getLessons(moduleId as string);
    res.json({ data: lessons });
  } catch (error) {
    next(error);
  }
});

router.get('/lessons/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const lesson = await contentService.getLessonById(requireParam(req.params.id, "id"));
    res.json({ data: lesson });
  } catch (error) {
    next(error);
  }
});

router.post('/lessons', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const lesson = await contentService.createLesson(req.body);
    res.status(201).json({ data: lesson });
  } catch (error) {
    next(error);
  }
});

router.put('/lessons/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const lesson = await contentService.updateLesson(requireParam(req.params.id, "id"), req.body);
    res.json({ data: lesson });
  } catch (error) {
    next(error);
  }
});

router.delete('/lessons/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await contentService.deleteLesson(requireParam(req.params.id, "id"));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post('/lesson-sections', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const section = await contentService.createLessonSection(req.body);
    res.status(201).json({ data: section });
  } catch (error) {
    next(error);
  }
});

router.put('/lesson-sections/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const section = await contentService.updateLessonSection(requireParam(req.params.id, "id"), req.body);
    res.json({ data: section });
  } catch (error) {
    next(error);
  }
});

router.delete('/lesson-sections/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await contentService.deleteLessonSection(requireParam(req.params.id, "id"));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post('/exercises', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const exercise = await contentService.createExercise(req.body);
    res.status(201).json({ data: exercise });
  } catch (error) {
    next(error);
  }
});

router.put('/exercises/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const exercise = await contentService.updateExercise(requireParam(req.params.id, "id"), req.body);
    res.json({ data: exercise });
  } catch (error) {
    next(error);
  }
});

router.delete('/exercises/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await contentService.deleteExercise(requireParam(req.params.id, "id"));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post('/exercise-prompts', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const prompt = await contentService.createExercisePrompt(req.body);
    res.status(201).json({ data: prompt });
  } catch (error) {
    next(error);
  }
});

router.put('/exercise-prompts/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const prompt = await contentService.updateExercisePrompt(requireParam(req.params.id, "id"), req.body);
    res.json({ data: prompt });
  } catch (error) {
    next(error);
  }
});

router.delete('/exercise-prompts/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await contentService.deleteExercisePrompt(requireParam(req.params.id, "id"));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
