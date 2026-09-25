'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, Clock } from 'lucide-react';
import { useNotificationStore, useAuthStore } from '@/lib/store';
import { formatDistanceToNow } from 'date-fns';
import api from '@/lib/api';
import Link from 'next/link';

export default function NotificationBell() {
  const { notifications, unreadCount, setNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const { accessToken } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Polling logic moved to NotificationPoller to prevent double polling

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.patch(`/notifications/${id}/read`);
      markAsRead(id);
    } catch (error) {
      console.error('Failed to mark read', error);
    }
  };

  const handleMarkAll = async () => {
    try {
      await api.patch('/notifications/read-all');
      markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all read', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-text-muted hover:text-text-primary transition-colors border border-white/[0.06] rounded-lg hover:bg-surface-2/50"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-primary rounded-full translate-x-1/3 -translate-y-1/3 border-2 border-[#0A0A0A]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-card rounded-xl shadow-2xl z-50 border border-white/[0.1] overflow-hidden flex flex-col max-h-[80vh]">
          <div className="p-4 border-b border-white/[0.06] flex items-center justify-between bg-surface-1/50 sticky top-0 z-10">
            <h3 className="font-medium text-text-primary">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-xs text-primary hover:text-primary-dark transition-colors font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-text-muted text-sm flex flex-col items-center gap-2">
                <CheckCircle className="w-8 h-8 opacity-20" />
                No notifications yet.
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notif) => (
                  <Link
                    key={notif._id}
                    href={notif.relatedIssue ? `/dashboard/issues?id=${notif.relatedIssue}` : '#'}
                    onClick={() => {
                      if (!notif.isRead) {
                        api.patch(`/notifications/${notif._id}/read`).then(() => markAsRead(notif._id)).catch(console.error);
                      }
                      setIsOpen(false);
                    }}
                    className={`p-4 border-b border-white/[0.04] transition-colors hover:bg-surface-2/40 block relative ${!notif.isRead ? 'bg-primary/5' : ''}`}
                  >
                    {!notif.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                    )}
                    <div className="flex justify-between items-start mb-1">
                      <p className={`text-sm ${!notif.isRead ? 'font-semibold text-text-primary' : 'font-medium text-text-muted'}`}>
                        {notif.title}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-text-muted shrink-0 ml-2 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                    <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    {!notif.isRead && (
                      <button 
                        onClick={(e) => handleMarkAsRead(notif._id, e)}
                        className="mt-2 text-[10px] text-primary hover:underline"
                      >
                        Mark as read
                      </button>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
