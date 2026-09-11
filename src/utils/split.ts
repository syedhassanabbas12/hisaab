import { Expense, Group, Settlement } from '../types';

/** Net balance per member for a group: positive = others owe them, negative = they owe others. */
export function computeBalances(
  group: Group,
  expenses: Expense[],
  settlements: Settlement[]
): Record<string, number> {
  const balances: Record<string, number> = {};
  group.members.forEach((m) => (balances[m.id] = 0));

  for (const exp of expenses) {
    if (exp.groupId !== group.id) continue;
    balances[exp.paidByMemberId] = (balances[exp.paidByMemberId] ?? 0) + exp.amountPkr;
    for (const share of exp.shares) {
      balances[share.memberId] = (balances[share.memberId] ?? 0) - share.amountPkr;
    }
  }

  for (const s of settlements) {
    if (s.groupId !== group.id) continue;
    balances[s.fromMemberId] = (balances[s.fromMemberId] ?? 0) + s.amountPkr;
    balances[s.toMemberId] = (balances[s.toMemberId] ?? 0) - s.amountPkr;
  }

  return balances;
}

export interface SuggestedPayment {
  fromMemberId: string;
  toMemberId: string;
  amountPkr: number;
}

/** Simplify a set of balances into the minimum number of payments to settle up. */
export function simplifyDebts(balances: Record<string, number>): SuggestedPayment[] {
  const creditors: { id: string; amount: number }[] = [];
  const debtors: { id: string; amount: number }[] = [];

  Object.entries(balances).forEach(([id, amount]) => {
    const rounded = Math.round(amount * 100) / 100;
    if (rounded > 0.5) creditors.push({ id, amount: rounded });
    else if (rounded < -0.5) debtors.push({ id, amount: -rounded });
  });

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const payments: SuggestedPayment[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > 0.5) {
      payments.push({
        fromMemberId: debtor.id,
        toMemberId: creditor.id,
        amountPkr: Math.round(amount),
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount <= 0.5) i++;
    if (creditor.amount <= 0.5) j++;
  }

  return payments;
}

export function equalShares(amountPkr: number, memberIds: string[]) {
  const base = Math.floor(amountPkr / memberIds.length);
  let remainder = Math.round(amountPkr - base * memberIds.length);
  return memberIds.map((memberId) => {
    const extra = remainder > 0 ? 1 : 0;
    if (remainder > 0) remainder--;
    return { memberId, amountPkr: base + extra };
  });
}
