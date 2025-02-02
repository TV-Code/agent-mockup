import { TaskUpdate } from '../types/task';

export class WebSocketService {
    private ws: WebSocket | null = null;
    private readonly url: string;
    private reconnectAttempts: number = 0;
    private readonly maxReconnectAttempts: number = 5;
    private onMessageCallback: ((data: TaskUpdate) => void) | null = null;
    private reconnectTimeout: NodeJS.Timeout | null = null;

    constructor(url: string = 'ws://localhost:8000/ws') {
        this.url = url;
    }

    connect(): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            console.log('WebSocket is already connected');
            return;
        }

        try {
            this.ws = new WebSocket(this.url);
            
            this.ws.onopen = () => {
                console.log('WebSocket connection established');
                this.reconnectAttempts = 0;
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data) as TaskUpdate;
                    if (this.onMessageCallback) {
                        this.onMessageCallback(data);
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            this.ws.onclose = (event) => {
                console.log('WebSocket connection closed', event.code, event.reason);
                this.attemptReconnect();
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                // Don't attempt to reconnect here, let onclose handle it
            };
        } catch (error) {
            console.error('Failed to establish WebSocket connection:', error);
            this.attemptReconnect();
        }
    }

    private attemptReconnect(): void {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            this.reconnectTimeout = setTimeout(() => {
                this.connect();
            }, 3000);
        } else {
            console.log('Max reconnection attempts reached');
        }
    }

    setOnMessageCallback(callback: (data: TaskUpdate) => void): void {
        this.onMessageCallback = callback;
    }

    sendMessage(message: any): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.error('WebSocket is not connected');
        }
    }

    disconnect(): void {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        if (this.ws) {
            this.ws.onclose = null; // Prevent reconnection attempt on manual disconnect
            this.ws.close();
            this.ws = null;
        }
    }
} 