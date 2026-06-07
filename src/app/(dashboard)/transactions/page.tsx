'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import TransactionFormModal from '@/components/TransactionFormModal';
import { formatMoney, formatDate } from '@/lib/format';
import type { ReceiptSplit } from '@/lib/types';

type Tab = 'all' | 'sale' | 'purchase';

const tabs: { key: Tab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'purchase', label: 'Purchases' },
  { key: 'sale', label: 'Sales' },
];

function receiptSummary(splits: ReceiptSplit[]) {
  const withReceipt = splits
    .filter((s) => s.has_receipt)
    .reduce((sum, s) => sum + s.quantity, 0);
  const withoutReceipt = splits
    .filter((s) => !s.has_receipt)
    .reduce((sum, s) => sum + s.quantity, 0);
  return `${withReceipt} ✅ ${withoutReceipt} ❌`;
}

export default function TransactionsPage() {
  const [tab, setTab] = useState<Tab>('all');
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading, isError } = useTransactions(
    tab === 'all' ? undefined : tab
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex overflow-hidden rounded-lg border border-gray-200 bg-white">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Record Transaction
        </button>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
        {isLoading ? (
          <div className="p-6 text-sm text-gray-500">Loading transactions...</div>
        ) : isError ? (
          <div className="p-6 text-sm text-red-600">Failed to load transactions.</div>
        ) : !data || data.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">No transactions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Quantity</th>
                  <th className="px-4 py-3 font-medium">Unit Price</th>
                  <th className="px-4 py-3 font-medium">Discount</th>
                  <th className="px-4 py-3 font-medium">Receipts</th>
                </tr>
              </thead>
              <tbody>
                {data.map((t) => (
                  <tr key={t.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{formatDate(t.created_at)}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{t.product.name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                          t.transaction_type === 'sale'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {t.transaction_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{t.total_quantity}</td>
                    <td className="px-4 py-3 text-gray-600">{formatMoney(t.unit_price)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatMoney(t.discount_amount)}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {receiptSummary(t.receipt_splits)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && <TransactionFormModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}
