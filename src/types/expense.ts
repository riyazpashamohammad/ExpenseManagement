// src/types/expense.ts
export interface Expense {
  id?: string;
  title: string;
  category: string;
  amount: number;
  userId: string;
  date: string;
}
