import { TaskStatus } from '../types/task';

interface TaskUpdate {
  taskId: string;
  status: TaskStatus;
  progress: number;
}

interface MessageUpdate {
  taskId: string;
  message: string;
  type: 'user' | 'system';
}

type WebSocketCallback<T> = (data: T) => void;

class TaskWebSocketConnection {
  private ws: WebSocket | null = null;
  private readonly taskId: string;
  private pollCount = 0;
  private readonly maxPolls = 10;
  private pollInterval: NodeJS.Timeout | null = null;
  private onMessageCallback: WebSocketCallback<any> | null = null;
  private isConnecting = false;

  constructor(taskId: string) {
    this.taskId = taskId;
  }

  connect(): void {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isConnecting = true;

    try {
      this.ws = new WebSocket(`ws://localhost:8000/ws/task/${this.taskId}`);
      
      this.ws.onopen = () => {
        console.log(`WebSocket connected for task ${this.taskId}`);
        this.isConnecting = false;
        this.startPolling();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.onMessageCallback?.(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log(`WebSocket disconnected for task ${this.taskId}`);
        this.isConnecting = false;
        this.stopPolling();
      };

      this.ws.onerror = (error) => {
        console.error(`WebSocket error for task ${this.taskId}:`, error);
        this.isConnecting = false;
      };
    } catch (error) {
      console.error(`Failed to establish WebSocket connection for task ${this.taskId}:`, error);
      this.isConnecting = false;
    }
  }

  private startPolling(): void {
    this.pollCount = 0;
    this.poll();
  }

  private poll(): void {
    if (this.pollCount >= this.maxPolls) {
      console.log(`Max polls reached for task ${this.taskId}`);
      this.disconnect();
      return;
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'poll', taskId: this.taskId }));
      this.pollCount++;

      this.pollInterval = setTimeout(() => {
        this.poll();
      }, 10000); // Poll every 10 seconds
    }
  }

  private stopPolling(): void {
    if (this.pollInterval) {
      clearTimeout(this.pollInterval);
      this.pollInterval = null;
    }
  }

  setCallback<T>(callback: WebSocketCallback<T>): void {
    this.onMessageCallback = callback;
  }

  disconnect(): void {
    this.stopPolling();

    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
  }
}

export class WebSocketService {
  private taskConnections: Map<string, TaskWebSocketConnection> = new Map();

  createTaskConnection(taskId: string, callback: WebSocketCallback<TaskUpdate | MessageUpdate>): void {
    // Clean up existing connection if any
    this.closeTaskConnection(taskId);

    // Create new connection
    const connection = new TaskWebSocketConnection(taskId);
    connection.setCallback(callback);
    connection.connect();
    this.taskConnections.set(taskId, connection);
  }

  closeTaskConnection(taskId: string): void {
    const connection = this.taskConnections.get(taskId);
    if (connection) {
      connection.disconnect();
      this.taskConnections.delete(taskId);
    }
  }

  closeAllConnections(): void {
    Array.from(this.taskConnections.values()).forEach(connection => {
      connection.disconnect();
    });
    this.taskConnections.clear();
  }
} 