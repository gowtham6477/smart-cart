import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck, AlertTriangle } from 'lucide-react';
import { workerAPI, adminAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function NotificationBell({ userType = 'employee', enableToasts = true }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const initializedRef = useRef(false);
  const knownIdsRef = useRef(new Set());
  const audioRef = useRef(null);
  const autoOpenTimeoutRef = useRef(null);

  const api = userType === 'admin' ? adminAPI : workerAPI;

  useEffect(() => {
    loadUnreadCount();
    loadNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      loadUnreadCount();
      loadNotifications(enableToasts);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showDropdown) {
      loadNotifications();
    }
  }, [showDropdown]);

  const loadUnreadCount = async () => {
    try {
      const res = await api.getUnreadCount();
      setUnreadCount(res.data.data || 0);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const normalizeNotifications = (data = []) =>
    data.map((n) => ({
      ...n,
      read: n.read ?? n.isRead ?? false,
    }));

  const playNotificationSound = () => {
    try {
      audioRef.current?.play().catch(() => {});
    } catch (error) {
      // ignore audio errors
    }
  };

  const loadNotifications = async (showToast = true) => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      const normalized = normalizeNotifications(res.data.data || []);
      const newItems = normalized.filter(n => !knownIdsRef.current.has(n.id));
      setNotifications(normalized);
      const unread = normalized.filter(n => !n.read).length;
      setUnreadCount(unread);

      if (!initializedRef.current) {
        normalized.forEach(n => knownIdsRef.current.add(n.id));
        initializedRef.current = true;
      } else if (newItems.length > 0) {
        newItems.forEach(n => knownIdsRef.current.add(n.id));
        playNotificationSound();
        if (showToast && enableToasts) {
          const latest = newItems[0];
          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-red-600 text-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-10 h-10 text-white animate-pulse" />
                  <div className="ml-3 flex-1">
                    <p className="text-lg font-bold">{latest.title || 'New notification'}</p>
                    {latest.message && (
                      <p className="mt-1 text-sm text-red-100 whitespace-pre-line">{latest.message}</p>
                    )}
                    {newItems.length > 1 && (
                      <p className="text-xs text-red-100 mt-2">+{newItems.length - 1} more</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex border-l border-red-500">
                <button onClick={() => toast.dismiss(t.id)} className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-100 hover:text-white focus:outline-none">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ), { duration: 10000 });
        }
        setShowDropdown(true);
        if (autoOpenTimeoutRef.current) {
          clearTimeout(autoOpenTimeoutRef.current);
        }
        autoOpenTimeoutRef.current = setTimeout(() => {
          setShowDropdown(false);
        }, 8000);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      if (showToast) {
        toast.error('Failed to load notifications');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      loadUnreadCount();
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      TASK_ASSIGNED: '📋',
      ORDER_STATUS_CHANGED: '📦',
      ORDER_OUT_FOR_DELIVERY: '🚚',
      ORDER_DELIVERED: '✅',
      ORDER_DAMAGED: '⚠️',
      ORDER_REPLACEMENT_REQUESTED: '🔄',
      CHECK_IN: '👋',
      CHECK_OUT: '👋',
    };
    return icons[type] || '🔔';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="relative">
      <audio
        ref={audioRef}
        src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleAsffLvf/9BtABVtr/P/sT8A"
      />
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <CheckCheck className="w-4 h-4" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setShowDropdown(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                  <Bell className="w-12 h-12 mb-2 opacity-20" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition cursor-pointer ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-gray-900 text-sm">
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    // Navigate to notifications page if exists
                  }}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

