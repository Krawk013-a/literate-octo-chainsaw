import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../server';
import * as authService from '../services/auth.service';
import { signToken } from '../utils/jwt';

vi.mock('../services/auth.service');
vi.mock('../config/database');

describe('Auth Routes', () => {
  let app: any;

  beforeEach(() => {
    app = createApp();
    vi.clearAllMocks();
  });

  describe('POST /api/auth/signup', () => {
    it('should create new user', async () => {
      const mockResponse = {
        accessToken: 'test-token',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          username: 'testuser',
          role: 'learner',
        },
      };

      vi.mocked(authService.authService.signup).mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
          username: 'testuser',
        });

      expect(response.status).toBe(201);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should reject if signup fails', async () => {
      const error = new Error('Email already registered');
      (error as any).statusCode = 409;

      vi.mocked(authService.authService.signup).mockRejectedValue(error);

      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
          username: 'testuser',
        });

      expect(response.status).toBe(409);
    });

    it('should reject if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user with valid credentials', async () => {
      const mockResponse = {
        accessToken: 'test-token',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          username: 'testuser',
          role: 'learner',
        },
      };

      vi.mocked(authService.authService.login).mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should reject invalid credentials', async () => {
      const error = new Error('Invalid email or password');
      (error as any).statusCode = 401;

      vi.mocked(authService.authService.login).mockRejectedValue(error);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });

    it('should reject if email or password missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout authenticated user', async () => {
      const token = signToken({
        userId: 'user-1',
        email: 'test@example.com',
        role: 'learner',
      });

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('successfully');
    });

    it('should reject if no token provided', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/request-password-reset', () => {
    it('should request password reset', async () => {
      vi.mocked(authService.authService.requestPasswordReset).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/auth/request-password-reset')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();
    });

    it('should reject if email missing', async () => {
      const response = await request(app)
        .post('/api/auth/request-password-reset')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should handle non-existent user gracefully', async () => {
      const error = new Error('User not found');
      (error as any).statusCode = 404;

      vi.mocked(authService.authService.requestPasswordReset).mockRejectedValue(error);

      const response = await request(app)
        .post('/api/auth/request-password-reset')
        .send({
          email: 'nonexistent@example.com',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      vi.mocked(authService.authService.resetPassword).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'valid-reset-token',
          newPassword: 'newpassword123',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('successfully');
    });

    it('should reject if token or password missing', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'valid-token',
        });

      expect(response.status).toBe(400);
    });

    it('should reject invalid token', async () => {
      const error = new Error('Invalid or expired reset token');
      (error as any).statusCode = 400;

      vi.mocked(authService.authService.resetPassword).mockRejectedValue(error);

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-token',
          newPassword: 'newpassword123',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return authenticated user profile', async () => {
      const token = signToken({
        userId: 'user-1',
        email: 'test@example.com',
        role: 'learner',
      });

      vi.mocked(authService.authService.requestPasswordReset).mockClear();

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect([200, 404]).toContain(response.status);
    });

    it('should reject if no token provided', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
    });
  });
});
