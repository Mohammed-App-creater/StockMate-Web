import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Product } from '@/lib/types';

export interface ProductInput {
  name: string;
  category: string;
  unit: Product['unit'];
  buying_price: string;
  selling_price: string;
  barcode: string | null;
  current_stock: number;
}

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await api.get<Product[]>('/products/');
      return data;
    },
  });
}

export function useSearchProducts(q: string) {
  return useQuery<Product[]>({
    queryKey: ['products', 'search', q],
    queryFn: async () => {
      const { data } = await api.get<Product[]>('/products/search', {
        params: { q },
      });
      return data;
    },
    enabled: q.trim().length > 0,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProductInput) => {
      const { data } = await api.post<Product>('/products/', input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: ProductInput }) => {
      const { data } = await api.put<Product>(`/products/${id}`, input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/products/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
