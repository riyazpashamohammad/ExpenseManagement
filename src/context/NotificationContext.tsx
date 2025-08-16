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
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string) => void;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load notifications from Firestore on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const notifs: Notification[] = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Notification));
      setNotifications(notifs);
    };
    fetchNotifications();
  }, []);

  // Add notification to Firestore
  const addNotification = async (message: string) => {
    const notif = { message, read: false, createdAt: Date.now() };
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
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
};
