import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../server';
import * as profileService from '../services/profile.service';
import { signToken } from '../utils/jwt';

vi.mock('../services/profile.service');
vi.mock('../config/database');

describe('Profile Routes', () => {
  let app: any;
  let authToken: string;

  beforeEach(() => {
    app = createApp();
    authToken = signToken({
      userId: 'user-1',
      email: 'test@example.com',
      role: 'learner',
    });
    vi.clearAllMocks();
  });

  describe('GET /api/user/profile', () => {
    it('should return user profile', async () => {
      const mockProfile = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        role: 'learner',
        createdAt: new Date(),
        profile: {
          id: 'profile-1',
          userId: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
          avatar: null,
          bio: null,
          timezone: 'UTC',
          language: 'en',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      vi.mocked(profileService.profileService.getProfile).mockResolvedValue(mockProfile);

      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.email).toBe('test@example.com');
    });

    it('should reject without authentication', async () => {
      const response = await request(app)
        .get('/api/user/profile');

      expect(response.status).toBe(401);
    });

    it('should handle user not found', async () => {
      const error = new Error('User not found');
      (error as any).statusCode = 404;

      vi.mocked(profileService.profileService.getProfile).mockRejectedValue(error);

      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/user/profile', () => {
    it('should update user profile', async () => {
      const mockProfile = {
        id: 'profile-1',
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Smith',
        avatar: 'avatar.jpg',
        bio: null,
        timezone: 'UTC',
        language: 'en',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(profileService.profileService.updateProfile).mockResolvedValue(mockProfile);

      const response = await request(app)
        .patch('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'John',
          lastName: 'Smith',
          avatar: 'avatar.jpg',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.lastName).toBe('Smith');
    });

    it('should reject without authentication', async () => {
      const response = await request(app)
        .patch('/api/user/profile')
        .send({
          firstName: 'John',
        });

      expect(response.status).toBe(401);
    });

    it('should handle partial updates', async () => {
      const mockProfile = {
        id: 'profile-1',
        userId: 'user-1',
        firstName: 'Jane',
        lastName: null,
        avatar: null,
        bio: null,
        timezone: 'UTC',
        language: 'en',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(profileService.profileService.updateProfile).mockResolvedValue(mockProfile);

      const response = await request(app)
        .patch('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Jane',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.firstName).toBe('Jane');
    });
  });

  describe('GET /api/user/preferences', () => {
    it('should return user preferences', async () => {
      const mockPreferences = {
        id: 'pref-1',
        userId: 'user-1',
        dailyGoalMinutes: 30,
        emailNotifications: true,
        pushNotifications: true,
        soundEnabled: true,
        vibrationEnabled: true,
        darkMode: false,
        autoPlayAudio: true,
        showTranslations: true,
        difficultyLevel: 'intermediate',
        reminderTime: '19:00',
        weeklyReportDay: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(profileService.profileService.getPreferences).mockResolvedValue(mockPreferences);

      const response = await request(app)
        .get('/api/user/preferences')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.dailyGoalMinutes).toBe(30);
    });

    it('should reject without authentication', async () => {
      const response = await request(app)
        .get('/api/user/preferences');

      expect(response.status).toBe(401);
    });

    it('should handle preferences not found', async () => {
      const error = new Error('Preferences not found');
      (error as any).statusCode = 404;

      vi.mocked(profileService.profileService.getPreferences).mockRejectedValue(error);

      const response = await request(app)
        .get('/api/user/preferences')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/user/preferences', () => {
    it('should update user preferences', async () => {
      const mockPreferences = {
        id: 'pref-1',
        userId: 'user-1',
        dailyGoalMinutes: 45,
        emailNotifications: false,
        pushNotifications: true,
        soundEnabled: true,
        vibrationEnabled: true,
        darkMode: true,
        autoPlayAudio: true,
        showTranslations: true,
        difficultyLevel: 'intermediate',
        reminderTime: '19:00',
        weeklyReportDay: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(profileService.profileService.updatePreferences).mockResolvedValue(mockPreferences);

      const response = await request(app)
        .patch('/api/user/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          dailyGoalMinutes: 45,
          emailNotifications: false,
          darkMode: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.darkMode).toBe(true);
      expect(response.body.data.dailyGoalMinutes).toBe(45);
    });

    it('should reject without authentication', async () => {
      const response = await request(app)
        .patch('/api/user/preferences')
        .send({
          darkMode: true,
        });

      expect(response.status).toBe(401);
    });

    it('should handle partial updates', async () => {
      const mockPreferences = {
        id: 'pref-1',
        userId: 'user-1',
        dailyGoalMinutes: 30,
        emailNotifications: true,
        pushNotifications: true,
        soundEnabled: true,
        vibrationEnabled: true,
        darkMode: true,
        autoPlayAudio: true,
        showTranslations: true,
        difficultyLevel: 'intermediate',
        reminderTime: '19:00',
        weeklyReportDay: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(profileService.profileService.updatePreferences).mockResolvedValue(mockPreferences);

      const response = await request(app)
        .patch('/api/user/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          darkMode: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.darkMode).toBe(true);
    });

    it('should validate learning goal settings', async () => {
      const mockPreferences = {
        id: 'pref-1',
        userId: 'user-1',
        dailyGoalMinutes: 120,
        emailNotifications: true,
        pushNotifications: true,
        soundEnabled: true,
        vibrationEnabled: true,
        darkMode: false,
        autoPlayAudio: true,
        showTranslations: true,
        difficultyLevel: 'advanced',
        reminderTime: '19:00',
        weeklyReportDay: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(profileService.profileService.updatePreferences).mockResolvedValue(mockPreferences);

      const response = await request(app)
        .patch('/api/user/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          dailyGoalMinutes: 120,
          difficultyLevel: 'advanced',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.difficultyLevel).toBe('advanced');
    });
  });
});
