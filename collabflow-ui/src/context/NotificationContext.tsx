import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { notificationsApi, type InAppNotification } from '../api/notifications';
import { useAuth } from './AuthContext';
import { useToast } from '../hooks/use-toast';

interface NotificationContextType {
  notifications: InAppNotification[];
  unreadCount: number;
  isConnected: boolean;
  isPanelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  prependNotification: (notification: InAppNotification) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isPanelOpen, setPanelOpen] = useState(false);

  const clientRef = useRef<Client | null>(null);

  const prependNotification = useCallback((notification: InAppNotification) => {
    setNotifications((prev) => {
      const withoutDuplicate = prev.filter((item) => item.id !== notification.id);
      return [notification, ...withoutDuplicate].slice(0, 50);
    });

    if (!notification.isRead) {
      setUnreadCount((prev) => prev + 1);
    }
  }, []);

  const loadInitial = useCallback(async () => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const [items, unread] = await Promise.all([
        notificationsApi.list(30),
        notificationsApi.unreadCount(),
      ]);

      setNotifications(items);
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to load notifications', error);
    }
  }, [currentUser]);

  const markAsRead = useCallback(async (id: string) => {
    const target = notifications.find((n) => n.id === id);
    if (!target || target.isRead) {
      return;
    }

    try {
      const updated = await notificationsApi.markRead(id);
      setNotifications((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  }, [notifications]);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read', error);
    }
  }, []);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    if (!currentUser) {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:9090/ws';

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl) as WebSocket,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setIsConnected(true);
        client.subscribe('/user/queue/notifications', (frame: IMessage) => {
          try {
            const incoming: InAppNotification = JSON.parse(frame.body);
            prependNotification(incoming);
            showToast('info', `${incoming.title}: ${incoming.message}`);
          } catch (error) {
            console.error('Failed to parse incoming notification', error);
          }
        });
      },
      onDisconnect: () => setIsConnected(false),
      onStompError: () => setIsConnected(false),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
      setIsConnected(false);
    };
  }, [currentUser, prependNotification, showToast]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      isConnected,
      isPanelOpen,
      setPanelOpen,
      markAsRead,
      markAllAsRead,
      prependNotification,
    }),
    [notifications, unreadCount, isConnected, isPanelOpen, markAsRead, markAllAsRead, prependNotification]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};
