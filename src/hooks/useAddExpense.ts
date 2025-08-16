import { useState } from 'react';
import { db, auth } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { AppUser, Group } from '../types/user';

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

  const saveExpense = async (onSuccess?: () => void) => {
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
        date: new Date().toISOString()
      });
      setSuccess(true);
      setTitle('');
      setCategory('');
      setAmount('');
      if (onSuccess) onSuccess();
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
    loading,
    success,
    error,
    saveExpense,
  };
}
