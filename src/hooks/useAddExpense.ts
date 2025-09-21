import { useState } from 'react';
import { db, auth } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';


export interface SaveExpenseOptions {
  mood?: string;
}

export function useAddExpense() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [groupId, setGroupId] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString());

  const saveExpense = async (options?: SaveExpenseOptions) => {
    setLoading(true);
    setError('');
    setSuccess(false);
    const user = auth.currentUser;
    if (!user) {
      setError('User not logged in');
      setLoading(false);
      return;
    }
    try {
      await addDoc(collection(db, 'expenses'), {
        title,
        category,
        amount: parseFloat(amount),
        currency,
        userId: user.uid,
        groupId: groupId || null,
        comment,
        expenseDate,
        mood: options?.mood || null,
      });
      setSuccess(true);
      setTitle('');
      setCategory('');
      setAmount('');
      setExpenseDate(new Date().toISOString());
      setCurrency('INR');
      setGroupId('');
      setComment('');
    } catch (e: any) {
      setError(e.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return {
    title,
    setTitle,
    category,
    setCategory,
    amount,
    setAmount,
    currency,
    setCurrency,
    groupId,
    setGroupId,
    comment,
    setComment,
    setExpenseDate,
    expenseDate,
    loading,
    success,
    error,
    saveExpense,
  };
}
