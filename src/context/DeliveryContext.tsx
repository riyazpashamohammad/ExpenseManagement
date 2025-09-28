import React, { createContext, useContext, useState, ReactNode } from 'react';
import { db } from '../services/firebase';
import { doc, setDoc, getDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { useAuth } from './AuthContext';

export type DeliveryItem = {
  id: string;
  name: string;
};

export type DeliveryState = 'delivered' | 'not_delivered';
// deliveryStatus[groupId][date][itemId] = state
export type DeliveryStatus = Record<string, Record<string, Record<string, DeliveryState | undefined>>>; // { groupId: { date: { itemId: 'delivered' | 'not_delivered' | undefined } } }

interface DeliveryContextType {
  items: DeliveryItem[];
  deliveryStatus: DeliveryStatus;
  setDeliveryState: (itemId: string, date: string, state: DeliveryState | undefined, groupId: string) => Promise<void>;
  addItem: (name: string) => void;
}

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

const initialItems: DeliveryItem[] = [
  { id: 'milk', name: 'Milk' },
  { id: 'maid', name: 'Maid' },
];

export const DeliveryProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<DeliveryItem[]>(initialItems);
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>({});
  const { appUser } = useAuth();

  // Load delivery status from Firestore on mount
  React.useEffect(() => {
    const fetchStatus = async () => {
      if (appUser) {
        // Fetch all groups for admin, or user groups for user
        let groupIds: string[] = [];
        if (appUser.role === 'admin') {
          const snap = await getDocs(collection(db, 'groups'));
          groupIds = snap.docs.map(doc => doc.id);
        } else {
          groupIds = appUser.groupIds || [];
        }
        let mergedStatus: DeliveryStatus = {};
        for (const gid of groupIds) {
          const groupDoc = doc(db, 'deliveryStatus', gid);
          const snap = await getDoc(groupDoc);
          if (snap.exists()) {
            const data = snap.data() as Record<string, Record<string, DeliveryState | undefined>>;
            mergedStatus[gid] = data;
          } else {
            mergedStatus[gid] = {};
          }
        }
        setDeliveryStatus(mergedStatus);
      }
    };
    fetchStatus();
  }, [appUser]);

  const setDeliveryState = async (itemId: string, date: string, state: DeliveryState | undefined, groupId: string) => {
    setDeliveryStatus((prev) => {
      const updated = {
        ...prev,
        [groupId]: {
          ...(prev[groupId] || {}),
          [date]: {
            ...((prev[groupId] || {})[date]),
            [itemId]: state,
          },
        },
      };
      if (groupId) {
        const groupDoc = doc(db, 'deliveryStatus', groupId);
        setDoc(groupDoc, updated[groupId], { merge: true });
      }
      return updated;
    });
  };

  const addItem = (name: string) => {
    const id = name.toLowerCase().replace(/\s+/g, '-');
    setItems((prev) => [...prev, { id, name }]);
  };

  return (
    <DeliveryContext.Provider value={{ items, deliveryStatus, setDeliveryState, addItem }}>
      {children}
    </DeliveryContext.Provider>
  );
};

export const useDelivery = () => {
  const context = useContext(DeliveryContext);
  if (!context) throw new Error('useDelivery must be used within a DeliveryProvider');
  return context;
}

// Helper for label
export function getDeliveryLabel(itemId: string) {
  if (itemId === 'maid') return 'Service Done';
  return 'Delivered';
}
