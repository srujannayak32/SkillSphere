import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function NotificationBadge() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/notifications', {
          withCredentials: true,
        });
        setNotifications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
      }
    };

    fetchNotifications();
  }, []);

  const hasUnread = notifications.some((notification) => !notification.read);

  return (
    <div className="relative">
      <button className="relative">
        Notifications
        {hasUnread && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>}
      </button>
    </div>
  );
}