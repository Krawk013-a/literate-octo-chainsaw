import { Router, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { profileService } from '../services/profile.service';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/error';

const router = Router();

router.post('/signup', async (req, res: Response, next: NextFunction) => {
  try {
    const { email, password, username, referralCode } = req.body;

    const result = await authService.signup({
      email,
      password,
      username,
      referralCode,
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(400, 'Email and password are required');
    }

    const result = await authService.login({
      email,
      password,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/logout', authenticate, (_req: AuthRequest, res: Response) => {
  res.json({ message: 'Logged out successfully' });
});

router.post('/request-password-reset', async (req, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new AppError(400, 'Email is required');
    }

    await authService.requestPasswordReset({ email });

    res.json({
      message: 'If an account exists with this email, you will receive a password reset link',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/reset-password', async (req, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      throw new AppError(400, 'Token and new password are required');
    }

    await authService.resetPassword({
      token,
      newPassword,
    });

    res.json({
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized');
    }

    const profile = await profileService.getProfile(req.user.userId);
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

export default router;
