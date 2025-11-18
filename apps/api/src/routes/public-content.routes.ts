import { Router, Response, NextFunction } from 'express';
import { contentService } from '../services/content.service';
import { AppError } from '../utils/error';

const router = Router();

function requireParam(value: string | undefined, name: string): string {
  if (!value) {
    throw new AppError(400, `${name} is required`);
  }
  return value;
}

router.get('/languages', async (_req, res: Response, next: NextFunction) => {
  try {
    const languages = await contentService.getLanguages();
    res.json({ data: languages });
  } catch (error) {
    next(error);
  }
});

router.get('/courses', async (req, res: Response, next: NextFunction) => {
  try {
    const { languageId } = req.query;
    const courses = await contentService.getCourses(
      languageId as string | undefined,
      true,
    );
    res.json({ data: courses });
  } catch (error) {
    next(error);
  }
});

router.get('/courses/:id', async (req, res: Response, next: NextFunction) => {
  try {
    const course = await contentService.getCourseById(requireParam(req.params.id, "id"));
    if (!course.isPublished) {
      res.status(404).json({ error: { message: 'Course not found' } });
      return;
    }
    res.json({ data: course });
  } catch (error) {
    next(error);
  }
});

export default router;
