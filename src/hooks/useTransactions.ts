import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Transaction } from '@/lib/types';

export interface ReceiptSplitInput {
  quantity: number;
  has_receipt: boolean;
}

export interface TransactionInput {
  product_id: string;
  transaction_type: 'purchase' | 'sale';
  total_quantity: number;
  unit_price: string;
  discount_amount: string;
  notes: string | null;
  receipt_splits: ReceiptSplitInput[];
}

export function useTransactions(type?: 'purchase' | 'sale') {
  return useQuery<Transaction[]>({
    queryKey: ['transactions', type ?? 'all'],
    queryFn: async () => {
      const { data } = await api.get<Transaction[]>('/transactions/', {
        params: type ? { type } : undefined,
      });
      return data;
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: TransactionInput) => {
      const { data } = await api.post<Transaction>('/transactions/', input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
