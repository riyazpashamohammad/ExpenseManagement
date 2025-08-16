import { useEffect, useState } from 'react';
import { db, auth } from '../services/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { AppUser } from '../types/user';
import { Expense } from '../types/expense';
import { format } from 'date-fns';

export function useExpenseReport() {
  const [daily, setDaily] = useState<Record<string, number>>({});
  const [monthly, setMonthly] = useState<Record<string, number>>({});
  const [yearly, setYearly] = useState<Record<string, number>>({});
  const [category, setCategory] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      setError('');
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('User not logged in');
        // TODO: Fetch user role and group info from Firestore
        // For now, assume admin if email contains 'admin', else normal user
        const isAdmin = user.email?.includes('admin');
        let ref;
        if (isAdmin) {
          ref = collection(db, 'expenses'); // admin sees all
        } else {
          ref = query(collection(db, 'expenses'), where('userId', '==', user.uid));
        }
        const snapshot = await getDocs(ref);
        const dailyTotals: Record<string, number> = {};
        const monthlyTotals: Record<string, number> = {};
        const yearlyTotals: Record<string, number> = {};
        const categoryTotals: Record<string, number> = {};
        const allExpenses: Expense[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as Expense;
          allExpenses.push({ ...data, id: doc.id });
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
  }, []);

  return { daily, monthly, yearly, category, expenses, loading, error };
}
