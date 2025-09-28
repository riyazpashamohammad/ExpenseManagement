
import { useEffect, useState } from 'react';
import { db, auth } from '../services/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { AppUser } from '../types/user';
import { Expense } from '../types/expense';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

export function useExpenseReport(groupId: string | null = null) {
  const [daily, setDaily] = useState<Record<string, number>>({});
  const [monthly, setMonthly] = useState<Record<string, number>>({});
  const [yearly, setYearly] = useState<Record<string, number>>({});
  const [category, setCategory] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const { appUser } = useAuth();


  useEffect(() => {
    if (!groupId) {
      setLoading(true);
      setDaily({});
      setMonthly({});
      setYearly({});
      setCategory({});
      setExpenses([]);
      return;
    }
    const fetchExpenses = async () => {
      setLoading(true);
      setError('');
      try {
        const user = auth.currentUser;
        if (!user || !appUser) throw new Error('User not logged in');
        let allExpenses: Expense[] = [];
        let expSnap;
        if (Array.isArray(groupId) && groupId.length > 0) {
          expSnap = await getDocs(
            query(collection(db, 'expenses'), where('groupId', 'in', groupId))
          );
        } else if (typeof groupId === 'string' && groupId) {
          expSnap = await getDocs(
            query(collection(db, 'expenses'), where('groupId', '==', groupId))
          );
        } else {
          setLoading(false);
          return;
        }
        expSnap.forEach((doc) => {
          const data = doc.data() as Expense;
          allExpenses.push({ ...data, id: doc.id });
        });
        // Deduplicate by expense id
        const allMap = new Map<string, Expense>();
        allExpenses.forEach(exp => {
          if (exp.id) allMap.set(exp.id, exp);
        });
        allExpenses = Array.from(allMap.values());

        // Calculate totals
        const dailyTotals: Record<string, number> = {};
        const monthlyTotals: Record<string, number> = {};
        const yearlyTotals: Record<string, number> = {};
        const categoryTotals: Record<string, number> = {};
        allExpenses.forEach((data) => {
          const date = new Date(data.expenseDate);
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
  }, [appUser, groupId]);

  return { daily, monthly, yearly, category, expenses, loading, error };
}
