import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/firebase';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: number;
  createdBy: string; // user id
  groupIds?: string[]; // group ids this notification is for
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string, createdBy: string, groupIds?: string[]) => void;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [userGroupIds, setUserGroupIds] = useState<string[]>([]);

  // Get user info from localStorage (set by AuthContext)
  useEffect(() => {
    const fetchUser = async () => {
      const userStr = localStorage.getItem('authUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserId(user.uid);
        // Fetch groupIds from users collection
        const userDoc = await getDocs(query(collection(db, 'users')));
        const userData = userDoc.docs.map(d => d.data()).find(u => u.id === user.uid);
        setUserGroupIds(userData?.groupIds || []);
      }
    };
    fetchUser();
  }, []);

  // Load notifications from Firestore on mount and filter for user
  useEffect(() => {
    const fetchNotifications = async () => {
      const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const notifs: Notification[] = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Notification));
      // Only show notifications created by user or for user's groups
      const filtered = notifs.filter(n =>
        n.createdBy === userId ||
        (n.groupIds && n.groupIds.some(gid => userGroupIds.includes(gid)))
      );
      setNotifications(filtered);
    };
    if (userId) fetchNotifications();
  }, [userId, userGroupIds]);

  // Add notification to Firestore
  const addNotification = async (message: string, createdBy: string, groupIds?: string[]) => {
    const notif = { message, read: false, createdAt: Date.now(), createdBy, groupIds };
    const docRef = await addDoc(collection(db, 'notifications'), notif);
    setNotifications((prev) => [
      { id: docRef.id, ...notif },
      ...prev,
    ]);
  };

  // Mark all as read in Firestore
  const markAllAsRead = async () => {
    const q = query(collection(db, 'notifications'));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (docSnap) => {
      if (!docSnap.data().read) {
        await updateDoc(doc(db, 'notifications', docSnap.id), { read: true });
      }
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Mark single notification as read in Firestore
  const markAsRead = async (id: string) => {
    await updateDoc(doc(db, 'notifications', id), { read: true });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAllAsRead, markAsRead, unreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
};
