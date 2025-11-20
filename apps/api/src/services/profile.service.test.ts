import { describe, it, expect, beforeEach, vi } from 'vitest';
import { profileService } from './profile.service';
import { prisma } from '../config/database';

vi.mock('../config/database');

describe('Profile Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        role: 'learner',
        createdAt: new Date(),
        profile: {
          id: 'profile-1',
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);

      const result = await profileService.getProfile('user-1');

      expect(result.id).toBe('user-1');
      expect(result.email).toBe('test@example.com');
      expect(result.profile?.firstName).toBe('John');
    });

    it('should reject if user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      try {
        await profileService.getProfile('nonexistent-user');
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.statusCode).toBe(404);
        expect(error.message).toContain('not found');
      }
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
      };

      const mockProfile = {
        id: 'profile-1',
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe Updated',
        avatar: 'avatar.jpg',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
      vi.mocked(prisma.profile.upsert).mockResolvedValue(mockProfile as never);

      const result = await profileService.updateProfile('user-1', {
        firstName: 'John',
        lastName: 'Doe Updated',
        avatar: 'avatar.jpg',
      });

      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe Updated');
      expect(result.avatar).toBe('avatar.jpg');
    });

    it('should reject if user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      try {
        await profileService.updateProfile('nonexistent-user', {
          firstName: 'John',
        });
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.statusCode).toBe(404);
      }
    });
  });

  describe('getPreferences', () => {
    it('should return user preferences', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
      };

      const mockPreferences = {
        id: 'pref-1',
        userId: 'user-1',
        dailyGoalMinutes: 30,
        emailNotifications: true,
        darkMode: false,
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
      vi.mocked(prisma.preferences.findUnique).mockResolvedValue(mockPreferences as never);

      const result = await profileService.getPreferences('user-1');

      expect(result.dailyGoalMinutes).toBe(30);
      expect(result.emailNotifications).toBe(true);
    });

    it('should reject if user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      try {
        await profileService.getPreferences('nonexistent-user');
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.statusCode).toBe(404);
      }
    });

    it('should reject if preferences not found', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
      vi.mocked(prisma.preferences.findUnique).mockResolvedValue(null);

      try {
        await profileService.getPreferences('user-1');
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.statusCode).toBe(404);
      }
    });
  });

  describe('updatePreferences', () => {
    it('should update user preferences', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
      };

      const mockPreferences = {
        id: 'pref-1',
        userId: 'user-1',
        dailyGoalMinutes: 45,
        emailNotifications: false,
        darkMode: true,
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
      vi.mocked(prisma.preferences.upsert).mockResolvedValue(mockPreferences as never);

      const result = await profileService.updatePreferences('user-1', {
        dailyGoalMinutes: 45,
        emailNotifications: false,
        darkMode: true,
      });

      expect(result.dailyGoalMinutes).toBe(45);
      expect(result.emailNotifications).toBe(false);
      expect(result.darkMode).toBe(true);
    });

    it('should reject if user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      try {
        await profileService.updatePreferences('nonexistent-user', {
          darkMode: true,
        });
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.statusCode).toBe(404);
      }
    });
  });
});
