import { useEffect, useState, useRef, useCallback } from 'react';
import type { TelemetryPayload } from '../types';

export function useTelemetryWebSocket(url = 'ws://localhost:8000/ws/telemetry') {
  const [data, setData] = useState<TelemetryPayload | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Event | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data) as TelemetryPayload;
          setData(parsed);
        } catch {
          // ignore parsing error
        }
      };

      ws.onerror = (e) => {
        setError(e);
      };

      ws.onclose = () => {
        setIsConnected(false);
        // attempt reconnect after 3s
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, 3000);
      };
    } catch (err) {
      setIsConnected(false);
    }
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { data, isConnected, error };
}
