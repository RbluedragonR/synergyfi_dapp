import { SOCKET_URL } from '@/constants/api';
import { io, Socket } from 'socket.io-client';

export class SocketService {
  private static instance: SocketService;
  public socket: Socket | null = null;
  public url: string;
  // Store pending events for re-emission
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private eventQueue: Map<string, any[]> = new Map();

  public constructor() {
    this.url = SOCKET_URL;
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connect(url: string = this.url): SocketService {
    if (!this.socket) {
      this.socket = io(url, {
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        randomizationFactor: 0.5,
        path: '/ws',
      });

      this.setupSocketListeners();
    }
    return this;
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.record('socket', 'Connected to server');
      // Re-emit all cached events after reconnection
      setTimeout(() => {
        this.eventQueue.forEach((args, event) => {
          this.socket?.emit(event, ...args);
        });
      }, 500);
    });

    this.socket.on('disconnect', () => {
      console.record('socket', 'Disconnected from server');
    });

    this.socket.on('reconnect_attempt', (attempt) => {
      console.record('socket', `Reconnection attempt #${attempt}`);
    });

    this.socket.on('reconnect', (attempt) => {
      console.record('socket', `Successfully reconnected after ${attempt} attempts`);
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Failed to reconnect');
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.eventQueue.clear(); // Clear event queue when disconnecting
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public emit(ev: string, ...args: any[]): void {
    if (this.socket) {
      this.socket.emit(ev, ...args);
      // Record emitted messages
      this.eventQueue.set(ev, args);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public on(ev: string, cb: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(ev, cb);
    }
  }

  public off(ev: string): void {
    if (this.socket) {
      this.socket.off(ev);
      // Remove event from queue when unsubscribing
      this.eventQueue.delete(ev);
    }
  }
}

export default SocketService;
