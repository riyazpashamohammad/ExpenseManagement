// src/types/expense.ts
export interface Expense {
  id?: string;
  title: string;
  category: string;
  amount: number;
  currency: string; // e.g. 'INR', 'USD'
  userId: string;
  comment?: string;
  date: string;
}
