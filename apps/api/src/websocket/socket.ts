import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { env } from '../config/env';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  authenticated?: boolean;
}

export function setupWebSocket(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
    },
  });

  // Middleware for authentication placeholder
  io.use((socket: any, next) => {
    // TODO: Implement actual authentication
    // For now, just log the connection attempt
    console.log(`[WebSocket] Connection attempt from ${socket.id}`);
    socket.authenticated = false;
    next();
  });

  // Connection handler
  io.on('connection', (socket: Socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    // Placeholder namespace setup for features
    // TODO: Implement namespace handlers for:
    // - /notifications - User notifications
    // - /live-exercises - Real-time exercise feedback
    // - /leaderboards - Live leaderboard updates
    // const notificationsNS = io.of('/notifications');
    // const liveExercisesNS = io.of('/live-exercises');
    // const leaderboardsNS = io.of('/leaderboards');

    socket.on('disconnect', () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
    });

    socket.on('error', (error) => {
      console.error(`[WebSocket] Error on ${socket.id}:`, error);
    });
  });

  return io;
}

export default setupWebSocket;
