'use client';

import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import TransactionFormModal from '@/components/TransactionFormModal';
import type { Transaction } from '@/lib/types';
import {
  fmt,
  Badge,
  SplitMini,
  SkeletonTable,
  EmptyState,
  Toast,
  Plus,
  ArrowRightLeft,
} from '@/components/ui';

type Tab = 'all' | 'sale' | 'purchase';

const initial = (name: string) => name.trim().charAt(0).toUpperCase() || '#';

function fmtDate(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  };
}

function receiptOk(t: Transaction) {
  return t.receipt_splits
    .filter((s) => s.has_receipt)
    .reduce((sum, s) => sum + s.quantity, 0);
}

export default function TransactionsPage() {
  const [tab, setTab] = useState<Tab>('all');
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const { data: all = [], isLoading } = useTransactions();

  const counts = {
    all: all.length,
    sale: all.filter((t) => t.transaction_type === 'sale').length,
    purchase: all.filter((t) => t.transaction_type === 'purchase').length,
  };
  const rows = all.filter((t) => tab === 'all' || t.transaction_type === tab);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  return (
    <div className="content__inner">
      <div className="pagehead">
        <div className="pills">
          <button
            className={'pill' + (tab === 'all' ? ' pill--active' : '')}
            onClick={() => setTab('all')}
          >
            All <span className="pill__count">{counts.all}</span>
          </button>
          <button
            className={'pill' + (tab === 'purchase' ? ' pill--active' : '')}
            onClick={() => setTab('purchase')}
          >
            Purchases <span className="pill__count">{counts.purchase}</span>
          </button>
          <button
            className={'pill' + (tab === 'sale' ? ' pill--active' : '')}
            onClick={() => setTab('sale')}
          >
            Sales <span className="pill__count">{counts.sale}</span>
          </button>
        </div>
        <button className="btn btn--primary" onClick={() => setModal(true)}>
          <Plus size={18} />
          Record Transaction
        </button>
      </div>

      <div className="card">
        <div className="card__head">
          <div>
            <div className="card__title">
              {tab === 'all' ? 'All Transactions' : tab === 'sale' ? 'Sales' : 'Purchases'}
            </div>
            <div className="card__sub">
              {isLoading ? 'Loading…' : `${rows.length} records · receipt compliance tracked`}
            </div>
          </div>
        </div>

        {isLoading ? (
          <SkeletonTable rows={8} cols={7} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<ArrowRightLeft size={32} />}
            title="No transactions yet"
            msg="Record your first sale or purchase to start tracking your books."
            action={
              <button className="btn btn--primary" onClick={() => setModal(true)}>
                <Plus size={18} />
                Record Transaction
              </button>
            }
          />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Type</th>
                <th className="num">Qty</th>
                <th className="num">Unit Price</th>
                <th className="num">Discount</th>
                <th>Receipt Splits</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => {
                const { date, time } = fmtDate(t.created_at);
                const disc = Number(t.discount_amount);
                return (
                  <tr key={t.id}>
                    <td>
                      <div className="cell-strong">{date}</div>
                      <div className="cellsub">
                        {time} · {t.id.slice(0, 8)}
                      </div>
                    </td>
                    <td>
                      <div className="prod-cell">
                        <span className="prod-thumb">{initial(t.product.name)}</span>
                        <div className="cell-strong">{t.product.name}</div>
                      </div>
                    </td>
                    <td>
                      {t.transaction_type === 'sale' ? (
                        <Badge tone="green" dot>
                          Sale
                        </Badge>
                      ) : (
                        <Badge tone="blue" dot>
                          Purchase
                        </Badge>
                      )}
                    </td>
                    <td className="num tnum cell-strong">{t.total_quantity}</td>
                    <td className="num tnum">{fmt(t.unit_price)}</td>
                    <td className="num tnum cell-muted">{disc ? '−' + fmt(disc) : '—'}</td>
                    <td>
                      <SplitMini ok={receiptOk(t)} total={t.total_quantity} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <TransactionFormModal open={modal} onClose={() => setModal(false)} onSaved={showToast} />
      {toast && <Toast>{toast}</Toast>}
    </div>
  );
}
