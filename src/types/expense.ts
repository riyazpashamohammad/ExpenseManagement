// src/types/expense.ts
export interface Expense {
  id?: string;
  title: string;
  category: string;
  amount: number;
  currency: string; // e.g. 'INR', 'USD'
  userId: string;
  groupId?: string | null;
  comment?: string;
  date: string;
}
