import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Response, NextFunction } from 'express';
import { authenticate, requireRole, requireAdmin, requireLearner, AuthRequest } from './auth';
import { signToken } from '../utils/jwt';

describe('Auth Middleware', () => {
  let mockReq: Partial<AuthRequest>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {};
    mockNext = vi.fn() as unknown as NextFunction;
  });

  describe('authenticate', () => {
    it('should reject request without authorization header', () => {
      authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'No token provided',
        }),
      );
    });

    it('should reject request with invalid token format', () => {
      mockReq.headers = { authorization: 'InvalidFormat token123' };
      
      authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
        }),
      );
    });

    it('should reject request with invalid token', () => {
      mockReq.headers = { authorization: 'Bearer invalid-token' };
      
      authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Invalid or expired token',
        }),
      );
    });

    it('should accept valid token and attach user to request', () => {
      const token = signToken({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'learner',
      });
      
      mockReq.headers = { authorization: `Bearer ${token}` };
      
      authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);
      
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user?.userId).toBe('user-123');
      expect(mockReq.user?.email).toBe('test@example.com');
      expect(mockReq.user?.role).toBe('learner');
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('requireRole', () => {
    it('should reject if user is not authenticated', () => {
      const middleware = requireRole('admin');
      
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Authentication required',
        }),
      );
    });

    it('should reject if user does not have required role', () => {
      mockReq.user = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'learner',
      };
      
      const middleware = requireRole('admin');
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: 'Insufficient permissions to access this resource',
        }),
      );
    });

    it('should allow if user has required role', () => {
      mockReq.user = {
        userId: 'user-123',
        email: 'admin@example.com',
        role: 'admin',
      };
      
      const middleware = requireRole('admin');
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should allow if user has any of multiple required roles', () => {
      mockReq.user = {
        userId: 'user-123',
        email: 'learner@example.com',
        role: 'learner',
      };
      
      const middleware = requireRole('learner', 'admin');
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('requireAdmin', () => {
    it('should reject non-admin users', () => {
      mockReq.user = {
        userId: 'user-123',
        email: 'learner@example.com',
        role: 'learner',
      };
      
      requireAdmin(mockReq as AuthRequest, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
        }),
      );
    });

    it('should allow admin users', () => {
      mockReq.user = {
        userId: 'admin-123',
        email: 'admin@example.com',
        role: 'admin',
      };
      
      requireAdmin(mockReq as AuthRequest, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('requireLearner', () => {
    it('should allow learner users', () => {
      mockReq.user = {
        userId: 'user-123',
        email: 'learner@example.com',
        role: 'learner',
      };
      
      requireLearner(mockReq as AuthRequest, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should also allow admin users', () => {
      mockReq.user = {
        userId: 'admin-123',
        email: 'admin@example.com',
        role: 'admin',
      };
      
      requireLearner(mockReq as AuthRequest, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should reject users without proper role', () => {
      mockReq.user = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'unknown',
      };
      
      requireLearner(mockReq as AuthRequest, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
        }),
      );
    });
  });
});
