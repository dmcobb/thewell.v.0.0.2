import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './auth-context';
import { SOCKET_URL } from '@/lib/constants';

export interface BackendNotification {
  id: string;
  user_id: string;
  from_user_id?: string;
  conversation_id?: string;
  notification_type: 'new_message' | 'new_match' | 'liked' | 'new_ad';
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

export interface UINotification {
  id: string;
  title: string;
  message: string;
  type: 'message' | 'match' | 'info' | 'error';
  data?: Record<string, any>;
  duration?: number;
  timestamp: number;
}

interface NotificationContextType {
  notifications: UINotification[];
  unreadCount: number;
  isSocketConnected: boolean;
  showNotification: (
    notification: Omit<UINotification, 'id' | 'timestamp'>,
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<UINotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize Socket.io connection
  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const initializeSocket = async () => {
      try {
        // Retrieve JWT token from AsyncStorage
        const token = await AsyncStorage.getItem('authToken');

        if (!token) {
          return;
        }

        // Initialize Socket.io connection with JWT token
        const newSocket = io(SOCKET_URL, {
          auth: {
            token: token,
          },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
          transports: ['polling'], // ONLY POLLING, NO WEBSOCKET
          timeout: 10000,
          // Prevent WebSocket upgrade attempts
          upgrade: false,
          // Add these for better polling
          forceNew: true,
          rememberUpgrade: false,
        });

        // Connection events
        newSocket.on('connect', () => {
          setIsSocketConnected(true);
        });

        newSocket.on('disconnect', () => {
          setIsSocketConnected(false);
        });

        newSocket.on('connect_error', (error) => {
          console.error('[DEBUG] Socket.io connection error:', error);
        });

        newSocket.on('error', (error) => {
          console.error('[DEBUG] Socket.io error:', error);
        });

        // Listen for new notifications from server
        newSocket.on(
          'new_notification',
          (notificationData: BackendNotification) => {
            const uiNotification: UINotification = {
              id: notificationData.id,
              title: notificationData.title,
              message: notificationData.message,
              type:
                notificationData.notification_type === 'new_message'
                  ? 'message'
                  : 'info',
              data: notificationData.data,
              duration: 5000,
              timestamp: Date.now(),
            };

            setNotifications((prev) => [uiNotification, ...prev]);

            // Update unread count
            if (notificationData.notification_type === 'new_message') {
              setUnreadCount((prev) => prev + 1);
            }
          },
        );

        // Listen for unread count updates
        newSocket.on(
          'unread_count_update',
          (data: { unread_count: number }) => {
            setUnreadCount(data.unread_count);
          },
        );

        setSocket(newSocket);
      } catch (error) {
        console.error('[DEBUG] Error initializing Socket.io:', error);
      }
    };

    initializeSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user?.id]);

  const showNotification = useCallback(
    (notification: Omit<UINotification, 'id' | 'timestamp'>) => {
      const id = `${Date.now()}-${Math.random()}`;
      const newNotification: UINotification = {
        ...notification,
        id,
        timestamp: Date.now(),
      };

      setNotifications((prev) => [newNotification, ...prev]);

      // Auto-remove after duration
      if (notification.duration) {
        setTimeout(() => {
          removeNotification(id);
        }, notification.duration);
      }
    },
    [],
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isSocketConnected,
        showNotification,
        removeNotification,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}
