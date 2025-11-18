import type { LessonProgressEvent, RealtimeEvents } from '@/services/sdk/types';

export type RealtimeStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'offline';

type EventKey = keyof RealtimeEvents;
type EventHandler<K extends EventKey> = (payload: RealtimeEvents[K]) => void;

type StatusListener = (status: RealtimeStatus) => void;

const DEFAULT_URL = import.meta.env.VITE_REALTIME_URL as string | undefined;

export class RealtimeClient {
  private socket?: WebSocket;
  private status: RealtimeStatus = 'idle';
  private reconnectAttempts = 0;
  private readonly listeners = new Map<EventKey, Set<(...args: any[]) => void>>();
  private readonly statusListeners = new Set<StatusListener>();
  private mockTimer?: number;
  private readonly url?: string;
  private readonly maxRetries: number;

  constructor(url = DEFAULT_URL, maxRetries = 5) {
    this.url = url;
    this.maxRetries = maxRetries;
  }

  connect() {
    if (typeof window === 'undefined') return;
    if (!this.url) {
      this.startMockStream();
      return;
    }

    if (this.socket) return;

    this.updateStatus('connecting');

    this.socket = new WebSocket(this.url);

    this.socket.addEventListener('open', () => {
      this.reconnectAttempts = 0;
      this.updateStatus('connected');
      this.stopMockStream();
    });

    this.socket.addEventListener('message', (event) => {
      try {
        const payload = JSON.parse(event.data) as {
          type: EventKey;
          data: RealtimeEvents[EventKey];
        };
        this.emit(payload.type, payload.data);
      } catch (error) {
        console.error('[Realtime] Failed to parse event', error);
      }
    });

    this.socket.addEventListener('close', () => {
      this.updateStatus('offline');
      this.socket = undefined;
      this.scheduleReconnect();
    });

    this.socket.addEventListener('error', (error) => {
      console.error('[Realtime] Socket error', error);
      this.socket?.close();
    });
  }

  disconnect() {
    this.socket?.close();
    this.socket = undefined;
    this.updateStatus('idle');
    this.stopMockStream();
  }

  subscribe<K extends EventKey>(event: K, handler: EventHandler<K>) {
    const handlers = this.listeners.get(event) ?? new Set();
    handlers.add(handler);
    this.listeners.set(event, handlers);

    return () => {
      handlers.delete(handler);
      if (!handlers.size) {
        this.listeners.delete(event);
      }
    };
  }

  onStatusChange(listener: StatusListener) {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  getStatus() {
    return this.status;
  }

  private emit<K extends EventKey>(event: K, payload: RealtimeEvents[K]) {
    this.listeners.get(event)?.forEach((handler) => handler(payload));
  }

  private updateStatus(status: RealtimeStatus) {
    this.status = status;
    this.statusListeners.forEach((listener) => listener(status));
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxRetries) {
      this.updateStatus('offline');
      this.startMockStream();
      return;
    }

    this.reconnectAttempts += 1;
    this.updateStatus('reconnecting');

    const delay = Math.min(1000 * 2 ** (this.reconnectAttempts - 1), 5000);

    window.setTimeout(() => {
      if (!this.url) return;
      this.connect();
    }, delay);
  }

  private startMockStream() {
    if (this.mockTimer) return;
    this.mockTimer = window.setInterval(() => {
      const event: LessonProgressEvent = {
        lessonId: 'lesson-' + Math.ceil(Math.random() * 3),
        userId: 'user-123',
        xpEarned: 15 + Math.floor(Math.random() * 10),
        accuracy: 80 + Math.floor(Math.random() * 20),
        completedAt: new Date().toISOString(),
      };
      this.emit('lesson-progress', event);
    }, 8000);
  }

  private stopMockStream() {
    if (this.mockTimer) {
      window.clearInterval(this.mockTimer);
      this.mockTimer = undefined;
    }
  }
}

export const realtimeClient = new RealtimeClient();
