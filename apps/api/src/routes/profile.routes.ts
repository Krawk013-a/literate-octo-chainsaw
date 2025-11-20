import { Router, Response, NextFunction } from 'express';
import { profileService } from '../services/profile.service';
import { authenticate, requireLearner, AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/error';

const router = Router();

router.use(authenticate);
router.use(requireLearner);

router.get('/profile', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized');
    }

    const profile = await profileService.getProfile(req.user.userId);
    res.json({ data: profile });
  } catch (error) {
    next(error);
  }
});

router.patch('/profile', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized');
    }

    const { firstName, lastName, avatar, bio, timezone, language } = req.body;

    const profile = await profileService.updateProfile(req.user.userId, {
      firstName,
      lastName,
      avatar,
      bio,
      timezone,
      language,
    });

    res.json({ data: profile });
  } catch (error) {
    next(error);
  }
});

router.get('/preferences', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized');
    }

    const preferences = await profileService.getPreferences(req.user.userId);
    res.json({ data: preferences });
  } catch (error) {
    next(error);
  }
});

router.patch('/preferences', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized');
    }

    const {
      dailyGoalMinutes,
      emailNotifications,
      pushNotifications,
      soundEnabled,
      vibrationEnabled,
      darkMode,
      autoPlayAudio,
      showTranslations,
      difficultyLevel,
      reminderTime,
      weeklyReportDay,
    } = req.body;

    const preferences = await profileService.updatePreferences(req.user.userId, {
      dailyGoalMinutes,
      emailNotifications,
      pushNotifications,
      soundEnabled,
      vibrationEnabled,
      darkMode,
      autoPlayAudio,
      showTranslations,
      difficultyLevel,
      reminderTime,
      weeklyReportDay,
    });

    res.json({ data: preferences });
  } catch (error) {
    next(error);
  }
});

export default router;
