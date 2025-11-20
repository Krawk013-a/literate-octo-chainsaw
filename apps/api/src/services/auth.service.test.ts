import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { authService } from './auth.service';
import * as bcryptModule from 'bcryptjs';

vi.mock('bcryptjs');
vi.mock('./email.service', () => ({
  emailService: {
    sendPasswordReset: vi.fn(),
    sendVerificationEmail: vi.fn(),
  },
}));

// Create proper mock for database
const mockPrisma = {
  user: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  passwordResetToken: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

vi.mock('../config/database', () => ({
  prisma: mockPrisma,
  checkDatabaseHealth: vi.fn(),
  disconnectDatabase: vi.fn(),
}));

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signup', () => {
    it('should create a new user with valid data', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashed-password',
        role: 'learner',
      };

      vi.mocked(bcryptModule.hash).mockResolvedValue('hashed-password' as never);
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser as never);

      const result = await authService.signup({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      });

      expect(result.user.email).toBe('test@example.com');
      expect(result.user.username).toBe('testuser');
      expect(result.accessToken).toBeDefined();
    });

    it('should reject password shorter than 8 characters', async () => {
      try {
        await authService.signup({
          email: 'test@example.com',
          password: 'short',
          username: 'testuser',
        });
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.statusCode).toBe(400);
        expect(error.message).toContain('at least 8 characters');
      }
    });

    it('should reject invalid email format', async () => {
      try {
        await authService.signup({
          email: 'invalid-email',
          password: 'password123',
          username: 'testuser',
        });
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.statusCode).toBe(400);
        expect(error.message).toContain('Invalid email');
      }
    });

    it('should reject username shorter than 3 characters', async () => {
      try {
        await authService.signup({
          email: 'test@example.com',
          password: 'password123',
          username: 'ab',
        });
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.statusCode).toBe(400);
        expect(error.message).toContain('between 3 and 20');
      }
    });

    it('should reject if email already exists', async () => {
      const existingUser = {
        id: 'existing-user',
        email: 'test@example.com',
        username: 'other',
      };

      mockPrisma.user.findFirst.mockResolvedValue(existingUser as never);

      try {
        await authService.signup({
          email: 'test@example.com',
          password: 'password123',
          username: 'testuser',
        });
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.statusCode).toBe(409);
        expect(error.message).toContain('already registered');
      }
    });

    it('should reject if username already exists', async () => {
      const existingUser = {
        id: 'existing-user',
        email: 'other@example.com',
        username: 'testuser',
      };

      mockPrisma.user.findFirst.mockResolvedValue(existingUser as never);

      try {
        await authService.signup({
          email: 'test@example.com',
          password: 'password123',
          username: 'testuser',
        });
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.statusCode).toBe(409);
        expect(error.message).toContain('already taken');
      }
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashed-password',
        role: 'learner',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as never);
      vi.mocked(bcryptModule.compare).mockResolvedValue(true as never);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBeDefined();
    });

    it('should reject invalid email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      try {
        await authService.login({
          email: 'nonexistent@example.com',
          password: 'password123',
        });
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.statusCode).toBe(401);
        expect(error.message).toContain('Invalid email or password');
      }
    });

    it('should reject invalid password', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashed-password',
        role: 'learner',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as never);
      vi.mocked(bcryptModule.compare).mockResolvedValue(false as never);

      try {
        await authService.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        });
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.statusCode).toBe(401);
        expect(error.message).toContain('Invalid email or password');
      }
    });
  });

  describe('requestPasswordReset', () => {
    it('should create password reset token for existing user', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as never);
      mockPrisma.passwordResetToken.create.mockResolvedValue({
        id: 'token-1',
        userId: 'user-1',
        token: 'reset-token',
        expiresAt: new Date(),
      } as never);

      await authService.requestPasswordReset({
        email: 'test@example.com',
      });

      expect(mockPrisma.passwordResetToken.create).toHaveBeenCalled();
    });

    it('should reject non-existent user email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      try {
        await authService.requestPasswordReset({
          email: 'nonexistent@example.com',
        });
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.statusCode).toBe(404);
        expect(error.message).toContain('not found');
      }
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const mockToken = {
        id: 'token-1',
        userId: 'user-1',
        token: 'reset-token',
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: null,
      };

      vi.mocked(bcryptModule.hash).mockResolvedValue('new-hashed-password' as never);
      mockPrisma.passwordResetToken.findUnique.mockResolvedValue(mockToken as never);
      mockPrisma.user.update.mockResolvedValue({} as never);
      mockPrisma.passwordResetToken.update.mockResolvedValue({} as never);

      await authService.resetPassword({
        token: 'reset-token',
        newPassword: 'newpassword123',
      });

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { password: 'new-hashed-password' },
      });
    });

    it('should reject invalid token', async () => {
      mockPrisma.passwordResetToken.findUnique.mockResolvedValue(null);

      try {
        await authService.resetPassword({
          token: 'invalid-token',
          newPassword: 'newpassword123',
        });
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.statusCode).toBe(400);
        expect(error.message).toContain('Invalid or expired');
      }
    });

    it('should reject already used token', async () => {
      const mockToken = {
        id: 'token-1',
        userId: 'user-1',
        token: 'reset-token',
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: new Date(),
      };

      mockPrisma.passwordResetToken.findUnique.mockResolvedValue(mockToken as never);

      try {
        await authService.resetPassword({
          token: 'reset-token',
          newPassword: 'newpassword123',
        });
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.statusCode).toBe(400);
        expect(error.message).toContain('already been used');
      }
    });

    it('should reject expired token', async () => {
      const mockToken = {
        id: 'token-1',
        userId: 'user-1',
        token: 'reset-token',
        expiresAt: new Date(Date.now() - 3600000),
        usedAt: null,
      };

      mockPrisma.passwordResetToken.findUnique.mockResolvedValue(mockToken as never);

      try {
        await authService.resetPassword({
          token: 'reset-token',
          newPassword: 'newpassword123',
        });
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.statusCode).toBe(400);
        expect(error.message).toContain('expired');
      }
    });
  });
});
