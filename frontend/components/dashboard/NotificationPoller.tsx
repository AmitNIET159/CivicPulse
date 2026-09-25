'use client';

import { useEffect } from 'react';
import { useNotificationStore, useAuthStore } from '@/lib/store';
import api from '@/lib/api';

export default function NotificationPoller() {
  const { setNotifications } = useNotificationStore();
  const { accessToken } = useAuthStore();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const fetchNotifications = async () => {
      // Pause polling if the document is not visible
      if (typeof document !== 'undefined' && document.hidden) {
        timeoutId = setTimeout(fetchNotifications, 30000);
        return;
      }

      try {
        if (!accessToken) return;
        const res = await api.get('/notifications');
        setNotifications(res.data.notifications, res.data.unreadCount);
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      }
      
      // Schedule next poll
      timeoutId = setTimeout(fetchNotifications, 30000);
    };

    if (accessToken) {
      // Start polling loop
      fetchNotifications();
    }

    // Handle visibility changes to immediately fetch if coming back
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        clearTimeout(timeoutId);
        fetchNotifications();
      }
    };
    
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      clearTimeout(timeoutId);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [accessToken, setNotifications]);

  return null;
}
