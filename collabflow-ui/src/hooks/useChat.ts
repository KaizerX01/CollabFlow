import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { chatApi, type ChatMessageResponse, type ChatMessageRequest } from '../api/chat';

// ─── Query-key factory ───────────────────────────────────────────────────────

export const chatKeys = {
  all: ['chat'] as const,
  byProject: (projectId: string) =>
    [...chatKeys.all, 'project', projectId] as const,
};

// ─── Hook: useChat ───────────────────────────────────────────────────────────

interface UseChatOptions {
  projectId: string;
  /** Number of historical messages to load (default 20, max 50) */
  historyLimit?: number;
}

interface UseChatReturn {
  /** All messages (history + live) in chronological order */
  messages: ChatMessageResponse[];
  /** Send a new message to the project chat */
  sendMessage: (content: string) => void;
  /** Whether the initial history is still loading */
  isLoading: boolean;
  /** Whether the WebSocket is connected */
  isConnected: boolean;
  /** Any error from the initial fetch */
  error: Error | null;
}

export function useChat({
  projectId,
  historyLimit = 20,
}: UseChatOptions): UseChatReturn {
  const queryClient = useQueryClient();
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [liveMessages, setLiveMessages] = useState<ChatMessageResponse[]>([]);

  // Track known message IDs to prevent duplicates (capped to avoid memory leak)
  const knownIdsRef = useRef<Set<string>>(new Set());
  const MAX_KNOWN_IDS = 500;

  // ── Fetch history via React Query ─────────────────────────────────

  const {
    data: history = [],
    isLoading,
    error,
  } = useQuery<ChatMessageResponse[], Error>({
    queryKey: chatKeys.byProject(projectId),
    queryFn: () => chatApi.getMessages(projectId, historyLimit),
    enabled: !!projectId,
    staleTime: 30_000,
  });

  // When history loads, seed the known-ID set
  useEffect(() => {
    if (history.length > 0) {
      const ids = new Set(history.map((m) => m.id));
      knownIdsRef.current = ids;
    }
  }, [history]);

  // Reset live messages when project changes
  useEffect(() => {
    setLiveMessages([]);
    knownIdsRef.current = new Set();
  }, [projectId]);

  // ── WebSocket lifecycle ───────────────────────────────────────────

  useEffect(() => {
    if (!projectId) return;

    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:9090/ws';

    const stompClient = new Client({
      webSocketFactory: () =>
        new SockJS(wsUrl) as WebSocket,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (msg) => {
        // Silence noisy STOMP debug in production
        if (import.meta.env.DEV) {
          console.debug('[STOMP]', msg);
        }
      },
      onConnect: () => {
        setIsConnected(true);

        // Subscribe to the project chat topic
        stompClient.subscribe(
          `/topic/chat/${projectId}`,
          (frame: IMessage) => {
            try {
              const message: ChatMessageResponse = JSON.parse(frame.body);

              // De-duplicate (e.g. if sender's own message echoed back)
              if (!knownIdsRef.current.has(message.id)) {
                knownIdsRef.current.add(message.id);
                // Cap the Set size to prevent unbounded memory growth
                if (knownIdsRef.current.size > MAX_KNOWN_IDS) {
                  const firstId = knownIdsRef.current.values().next().value;
                  if (firstId !== undefined) knownIdsRef.current.delete(firstId);
                }
                setLiveMessages((prev) => [...prev, message]);

                // Persist into React Query cache so messages survive tab switches
                queryClient.setQueryData<ChatMessageResponse[]>(
                  chatKeys.byProject(projectId),
                  (old = []) => [...old, message]
                );
              }
            } catch (err) {
              console.error('Failed to parse chat message:', err);
            }
          }
        );
      },
      onDisconnect: () => setIsConnected(false),
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers['message'], frame.body);
        setIsConnected(false);
      },
    });

    stompClient.activate();
    clientRef.current = stompClient;

    return () => {
      stompClient.deactivate();
      clientRef.current = null;
      setIsConnected(false);
    };
  }, [projectId]);

  // ── Send ──────────────────────────────────────────────────────────

  const sendMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || !clientRef.current?.connected) return;

      const payload: ChatMessageRequest = { content: trimmed };
      clientRef.current.publish({
        destination: `/app/chat.send/${projectId}`,
        body: JSON.stringify(payload),
      });
    },
    [projectId]
  );

  // ── Merged result ─────────────────────────────────────────────────
  // History already contains cache-persisted live messages,
  // so we only need to append truly new ones not yet in history.
  const historyIds = new Set(history.map((m) => m.id));
  const newLive = liveMessages.filter((m) => !historyIds.has(m.id));
  const messages: ChatMessageResponse[] = [...history, ...newLive];

  return {
    messages,
    sendMessage,
    isLoading,
    isConnected,
    error: error ?? null,
  };
}
