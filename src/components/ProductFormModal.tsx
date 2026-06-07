'use client';

import { useState } from 'react';
import Modal from './Modal';
import { useCreateProduct, useUpdateProduct, type ProductInput } from '@/hooks/useProducts';
import type { Product } from '@/lib/types';

interface ProductFormModalProps {
  product?: Product;
  onClose: () => void;
}

const units: Product['unit'][] = ['kg', 'piece', 'box', 'liter'];

export default function ProductFormModal({ product, onClose }: ProductFormModalProps) {
  const isEdit = Boolean(product);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [form, setForm] = useState<ProductInput>({
    name: product?.name ?? '',
    category: product?.category ?? '',
    unit: product?.unit ?? 'piece',
    buying_price: product?.buying_price ?? '',
    selling_price: product?.selling_price ?? '',
    barcode: product?.barcode ?? '',
    current_stock: product?.current_stock ?? 0,
  });
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const pending = createProduct.isPending || updateProduct.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload: ProductInput = {
      ...form,
      barcode: form.barcode ? form.barcode : null,
    };
    try {
      if (isEdit && product) {
        await updateProduct.mutateAsync({ id: product.id, input: payload });
      } else {
        await createProduct.mutateAsync(payload);
      }
      onClose();
    } catch {
      setError('Failed to save product. Please try again.');
    }
  };

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';
  const labelClass = 'mb-1 block text-sm font-medium text-gray-700';

  return (
    <Modal title={isEdit ? 'Edit Product' : 'Add Product'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Name</label>
          <input
            className={inputClass}
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <input
            className={inputClass}
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Unit</label>
            <select
              className={inputClass}
              value={form.unit}
              onChange={(e) => set('unit', e.target.value as Product['unit'])}
            >
              {units.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Current Stock</label>
            <input
              type="number"
              className={inputClass}
              value={form.current_stock}
              onChange={(e) => set('current_stock', Number(e.target.value))}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Buying Price</label>
            <input
              type="number"
              step="0.01"
              className={inputClass}
              value={form.buying_price}
              onChange={(e) => set('buying_price', e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Selling Price</label>
            <input
              type="number"
              step="0.01"
              className={inputClass}
              value={form.selling_price}
              onChange={(e) => set('selling_price', e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Barcode (optional)</label>
          <input
            className={inputClass}
            value={form.barcode ?? ''}
            onChange={(e) => set('barcode', e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {pending ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
