export type BillingCycle = 'weekly' | 'monthly' | 'yearly';

export type PaymentMethod =
  | 'jazzcash'
  | 'easypaisa'
  | 'bank'
  | 'card'
  | 'cash';

export interface Subscription {
  id: string;
  name: string;
  amountPkr: number;
  cycle: BillingCycle;
  nextRenewal: string; // ISO date
  paymentMethod: PaymentMethod;
  category: string;
  notes?: string;
}

export interface Member {
  id: string;
  name: string;
}

export interface Group {
  id: string;
  name: string;
  members: Member[];
}

export interface ExpenseShare {
  memberId: string;
  amountPkr: number;
}

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amountPkr: number;
  paidByMemberId: string;
  shares: ExpenseShare[];
  date: string; // ISO date
  paymentMethod: PaymentMethod;
}

export interface Settlement {
  id: string;
  groupId: string;
  fromMemberId: string;
  toMemberId: string;
  amountPkr: number;
  date: string;
  paymentMethod: PaymentMethod;
}
