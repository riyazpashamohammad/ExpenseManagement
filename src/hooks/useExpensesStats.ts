// src/hooks/useExpensesStats.ts
import { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, query, where, Query, CollectionReference, DocumentData } from 'firebase/firestore';
import { Expense } from '../types/expense';

// groupIds: string[]
export function useExpensesStats(groupIds?: string[]) {
  const [total, setTotal] = useState<number | null>(null);
  const [month, setMonth] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function fetchStats() {
      setLoading(true);
      let expenses: Expense[] = [];
      try {
        const colRef = collection(db, 'expenses');
        let q: Query<DocumentData> | CollectionReference<DocumentData> = colRef;
        if (groupIds && groupIds.length > 0) {
          // Firestore supports 'in' for up to 10 values
          q = query(colRef, where('groupId', 'in', groupIds.slice(0, 10)));         
          const snap = await getDocs(q);
          expenses = snap.docs.map(doc => doc.data() as Expense);
        }
      } catch (e) {
        setTotal(0);
        setMonth(0);
        setLoading(false);
        return;
      }
      if (ignore) return;
      setTotal(expenses.reduce((sum, e) => sum + (e.amount || 0), 0));
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      setMonth(
        expenses.filter(e => {
          const d = new Date(e.expenseDate);
          return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        }).reduce((sum, e) => sum + (e.amount || 0), 0)
      );
      setLoading(false);
    }
    fetchStats();
    return () => { ignore = true; };
  }, [Array.isArray(groupIds) ? groupIds.join(',') : '']);

  return { total, month, loading };
}
