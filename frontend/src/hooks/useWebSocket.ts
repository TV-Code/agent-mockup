import { useEffect, useRef, useState } from 'react';

export function useWebSocket(url: string) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number>();

  useEffect(() => {
    function connect() {
      const websocket = new WebSocket(url);

      websocket.onopen = () => {
        console.log('WebSocket connected');
        setWs(websocket);
        // Clear any pending reconnect timeouts
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
      };

      websocket.onclose = () => {
        console.log('WebSocket disconnected');
        setWs(null);
        // Attempt to reconnect after 2 seconds
        reconnectTimeoutRef.current = window.setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 2000);
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    }

    connect();

    // Cleanup function
    return () => {
      if (ws) {
        ws.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [url]);

  return ws;
} 