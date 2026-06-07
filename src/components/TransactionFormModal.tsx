'use client';

import { useState } from 'react';
import { Plus, Trash2, Search } from 'lucide-react';
import Modal from './Modal';
import { useSearchProducts } from '@/hooks/useProducts';
import { useDebounce } from '@/hooks/useDebounce';
import {
  useCreateTransaction,
  type ReceiptSplitInput,
  type TransactionInput,
} from '@/hooks/useTransactions';
import type { Product } from '@/lib/types';

interface TransactionFormModalProps {
  onClose: () => void;
}

export default function TransactionFormModal({ onClose }: TransactionFormModalProps) {
  const createTransaction = useCreateTransaction();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const { data: results } = useSearchProducts(debouncedSearch);
  const [showDropdown, setShowDropdown] = useState(false);

  const [selected, setSelected] = useState<Product | null>(null);
  const [type, setType] = useState<'purchase' | 'sale'>('sale');
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [unitPrice, setUnitPrice] = useState('');
  const [discount, setDiscount] = useState('0');
  const [notes, setNotes] = useState('');
  const [splits, setSplits] = useState<ReceiptSplitInput[]>([
    { quantity: 0, has_receipt: true },
  ]);
  const [error, setError] = useState<string | null>(null);

  const assigned = splits.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
  const splitsMatch = assigned === totalQuantity && totalQuantity > 0;

  const updateSplit = (index: number, patch: Partial<ReceiptSplitInput>) =>
    setSplits((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));

  const addSplit = () =>
    setSplits((prev) => [...prev, { quantity: 0, has_receipt: true }]);

  const removeSplit = (index: number) =>
    setSplits((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

  const pickProduct = (p: Product) => {
    setSelected(p);
    setSearch(p.name);
    setShowDropdown(false);
    if (!unitPrice) {
      setUnitPrice(type === 'sale' ? p.selling_price : p.buying_price);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selected) {
      setError('Please select a product.');
      return;
    }
    if (!splitsMatch) {
      setError('Receipt splits must sum to the total quantity.');
      return;
    }
    const payload: TransactionInput = {
      product_id: selected.id,
      transaction_type: type,
      total_quantity: totalQuantity,
      unit_price: unitPrice,
      discount_amount: discount || '0',
      notes: notes ? notes : null,
      receipt_splits: splits.map((s) => ({
        quantity: Number(s.quantity),
        has_receipt: s.has_receipt,
      })),
    };
    try {
      await createTransaction.mutateAsync(payload);
      onClose();
    } catch {
      setError('Failed to record transaction. Please try again.');
    }
  };

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';
  const labelClass = 'mb-1 block text-sm font-medium text-gray-700';

  return (
    <Modal title="Record Transaction" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product search */}
        <div className="relative">
          <label className={labelClass}>Product</label>
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              className={`${inputClass} pl-9`}
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelected(null);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
            />
          </div>
          {showDropdown && debouncedSearch && results && results.length > 0 && (
            <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
              {results.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => pickProduct(p)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    <span>{p.name}</span>
                    <span className="text-xs text-gray-400">
                      stock: {p.current_stock}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Type toggle */}
        <div>
          <label className={labelClass}>Type</label>
          <div className="flex overflow-hidden rounded-lg border border-gray-300">
            {(['purchase', 'sale'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  type === t ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Quantity</label>
            <input
              type="number"
              className={inputClass}
              value={totalQuantity}
              onChange={(e) => setTotalQuantity(Number(e.target.value))}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Unit Price</label>
            <input
              type="number"
              step="0.01"
              className={inputClass}
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Discount</label>
            <input
              type="number"
              step="0.01"
              className={inputClass}
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Notes</label>
          <textarea
            className={inputClass}
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Receipt splits */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Receipt Splits</label>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                splitsMatch
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {assigned} of {totalQuantity} assigned
            </span>
          </div>
          <div className="space-y-2">
            {splits.map((split, i) => (
              <div key={i} className="flex items-center gap-3">
                <input
                  type="number"
                  className={`${inputClass} flex-1`}
                  placeholder="Quantity"
                  value={split.quantity}
                  onChange={(e) =>
                    updateSplit(i, { quantity: Number(e.target.value) })
                  }
                />
                <label className="flex items-center gap-2 whitespace-nowrap text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={split.has_receipt}
                    onChange={(e) =>
                      updateSplit(i, { has_receipt: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  Has receipt
                </label>
                <button
                  type="button"
                  onClick={() => removeSplit(i)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove split"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addSplit}
            className="mt-2 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <Plus size={16} />
            Add Split
          </button>
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
            disabled={!splitsMatch || !selected || createTransaction.isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createTransaction.isPending ? 'Saving...' : 'Record'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
