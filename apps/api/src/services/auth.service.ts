import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { AppError } from '../utils/error';
import { signToken } from '../utils/jwt';
import { emailService } from './email.service';
import { v4 as uuidv4 } from 'uuid';

export interface SignupData {
  email: string;
  password: string;
  username: string;
  referralCode?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
}

export interface PasswordResetData {
  email: string;
}

export interface PasswordResetConfirmData {
  token: string;
  newPassword: string;
}

class AuthService {
  async signup(data: SignupData): Promise<AuthResponse> {
    const { email, password, username } = data;

    if (!email || !password || !username) {
      throw new AppError(400, 'Email, password, and username are required');
    }

    if (password.length < 8) {
      throw new AppError(400, 'Password must be at least 8 characters long');
    }

    if (!this.isValidEmail(email)) {
      throw new AppError(400, 'Invalid email format');
    }

    if (username.length < 3 || username.length > 20) {
      throw new AppError(400, 'Username must be between 3 and 20 characters');
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        throw new AppError(409, 'Email already registered');
      } else {
        throw new AppError(409, 'Username already taken');
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password: hashedPassword,
        role: 'learner',
        profile: {
          create: {},
        },
        preferences: {
          create: {},
        },
        streaks: {
          create: {
            current: 0,
            longest: 0,
            lastActive: new Date(),
          },
        },
      },
    });

    const accessToken = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const { email, password } = data;

    if (!email || !password) {
      throw new AppError(400, 'Email and password are required');
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new AppError(401, 'Invalid email or password');
    }

    const accessToken = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }

  async requestPasswordReset(data: PasswordResetData): Promise<void> {
    const { email } = data;

    if (!email) {
      throw new AppError(400, 'Email is required');
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 3600000);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt,
      },
    });

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    await emailService.sendPasswordReset(user.email, resetLink);
  }

  async resetPassword(data: PasswordResetConfirmData): Promise<void> {
    const { token, newPassword } = data;

    if (!token || !newPassword) {
      throw new AppError(400, 'Token and new password are required');
    }

    if (newPassword.length < 8) {
      throw new AppError(400, 'Password must be at least 8 characters long');
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      throw new AppError(400, 'Invalid or expired reset token');
    }

    if (resetToken.usedAt) {
      throw new AppError(400, 'This reset token has already been used');
    }

    if (resetToken.expiresAt < new Date()) {
      throw new AppError(400, 'Reset token has expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await Promise.all([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { token },
        data: { usedAt: new Date() },
      }),
    ]);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export const authService = new AuthService();
