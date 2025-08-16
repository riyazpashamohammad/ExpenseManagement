
import { useEffect, useState } from 'react';
import { db, auth } from '../services/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { AppUser } from '../types/user';
import { Expense } from '../types/expense';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

export function useExpenseReport() {
  const [daily, setDaily] = useState<Record<string, number>>({});
  const [monthly, setMonthly] = useState<Record<string, number>>({});
  const [yearly, setYearly] = useState<Record<string, number>>({});
  const [category, setCategory] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const { appUser } = useAuth();


  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      setError('');
      try {
        const user = auth.currentUser;
        if (!user || !appUser) throw new Error('User not logged in');
        const isAdmin = appUser.role === 'admin' || user.email?.includes('admin');
        let allExpenses: Expense[] = [];
        if (isAdmin) {
          // Admin: all expenses
          const snapshot = await getDocs(collection(db, 'expenses'));
          snapshot.forEach((doc) => {
            const data = doc.data() as Expense;
            allExpenses.push({ ...data, id: doc.id });
          });
        } else {
          // 1. Get all userIds in the groups the user is part of (from users collection)
          let userIds = [user.uid];
          if (appUser.groupIds && appUser.groupIds.length > 0) {
            // Firestore 'array-contains-any' is limited to 10 items
            const groupIdChunks = [];
            for (let i = 0; i < appUser.groupIds.length; i += 10) {
              groupIdChunks.push(appUser.groupIds.slice(i, i + 10));
            }
            let groupMembers = new Set<string>();
            for (const chunk of groupIdChunks) {
              const usersSnap = await getDocs(
                query(collection(db, 'users'), where('groupIds', 'array-contains-any', chunk))
              );
              usersSnap.forEach((doc) => {
                const data = doc.data();
                if (data.id) groupMembers.add(data.id);
              });
            }
            userIds = Array.from(new Set([user.uid, ...groupMembers]));
          }
          // 2. Query all expenses for these userIds (in batches of 10)
          const userIdChunks = [];
          for (let i = 0; i < userIds.length; i += 10) {
            userIdChunks.push(userIds.slice(i, i + 10));
          }
          for (const chunk of userIdChunks) {
            const expSnap = await getDocs(
              query(collection(db, 'expenses'), where('userId', 'in', chunk))
            );
            expSnap.forEach((doc) => {
              const data = doc.data() as Expense;
              allExpenses.push({ ...data, id: doc.id });
            });
          }
          // Deduplicate by expense id
          const allMap = new Map<string, Expense>();
          allExpenses.forEach(exp => {
            if (exp.id) allMap.set(exp.id, exp);
          });
          allExpenses = Array.from(allMap.values());
        }

        // Calculate totals
        const dailyTotals: Record<string, number> = {};
        const monthlyTotals: Record<string, number> = {};
        const yearlyTotals: Record<string, number> = {};
        const categoryTotals: Record<string, number> = {};
        allExpenses.forEach((data) => {
          const date = new Date(data.date);
          const dayKey = format(date, 'yyyy-MM-dd');
          const monthKey = format(date, 'yyyy-MM');
          const yearKey = format(date, 'yyyy');
          dailyTotals[dayKey] = (dailyTotals[dayKey] || 0) + data.amount;
          monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + data.amount;
          yearlyTotals[yearKey] = (yearlyTotals[yearKey] || 0) + data.amount;
          categoryTotals[data.category] = (categoryTotals[data.category] || 0) + data.amount;
        });
        setDaily(dailyTotals);
        setMonthly(monthlyTotals);
        setYearly(yearlyTotals);
        setCategory(categoryTotals);
        setExpenses(allExpenses);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch expenses');
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, [appUser]);

  return { daily, monthly, yearly, category, expenses, loading, error };
}
