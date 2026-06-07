'use client';

import { useEffect, useRef, useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import {
  useCreateTransaction,
  type TransactionInput,
} from '@/hooks/useTransactions';
import {
  fmt,
  Field,
  X,
  Search,
  Plus,
  Trash2,
  Check,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
} from '@/components/ui';

interface RecordModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (message: string) => void;
}

interface SplitRow {
  id: number;
  who: string;
  qty: string;
}

export default function TransactionFormModal({ open, onClose, onSaved }: RecordModalProps) {
  const { data: products = [] } = useProducts();
  const createTransaction = useCreateTransaction();

  const [type, setType] = useState<'sale' | 'purchase'>('sale');
  const [pid, setPid] = useState<string>('');
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('0');
  const [notes, setNotes] = useState('');
  const [splits, setSplits] = useState<SplitRow[]>([{ id: 1, who: '', qty: '' }]);
  const [error, setError] = useState<string | null>(null);
  const nextId = useRef(2);

  // reset each time the modal opens
  useEffect(() => {
    if (open) {
      setType('sale');
      setPid('');
      setQty('');
      setPrice('');
      setDiscount('0');
      setNotes('');
      setSplits([{ id: 1, who: '', qty: '' }]);
      setError(null);
      nextId.current = 2;
    }
  }, [open]);

  const selected = products.find((p) => p.id === pid);

  // autofill unit price from the product + transaction type
  useEffect(() => {
    if (selected) {
      setPrice(type === 'sale' ? selected.selling_price : selected.buying_price);
    }
  }, [pid, type, selected]);

  const qtyN = Number(qty) || 0;
  const assigned = splits.reduce((s, r) => s + (Number(r.qty) || 0), 0);
  const complete = assigned === qtyN && qtyN > 0 && !!pid;
  const total = qtyN * (Number(price) || 0) - (Number(discount) || 0);

  const addRow = () => {
    setSplits((prev) => [...prev, { id: nextId.current++, who: '', qty: '' }]);
  };
  const setRow = (id: number, k: 'who' | 'qty', v: string) =>
    setSplits((prev) => prev.map((r) => (r.id === id ? { ...r, [k]: v } : r)));
  const delRow = (id: number) =>
    setSplits((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));

  const save = async () => {
    setError(null);
    if (!complete) return;
    const payload: TransactionInput = {
      product_id: pid,
      transaction_type: type,
      total_quantity: qtyN,
      unit_price: price,
      discount_amount: discount || '0',
      notes: notes ? notes : null,
      // a split with a named recipient counts as having a receipt;
      // a blank recipient is recorded as an un-receipted split.
      receipt_splits: splits
        .map((r) => ({ quantity: Number(r.qty) || 0, has_receipt: r.who.trim().length > 0 }))
        .filter((r) => r.quantity > 0),
    };
    try {
      await createTransaction.mutateAsync(payload);
      onClose();
      onSaved('Transaction recorded');
    } catch {
      setError('Failed to record transaction. Please try again.');
    }
  };

  return (
    <>
      <div
        className={'overlay' + (open ? ' overlay--in' : '')}
        style={{ display: open ? 'block' : 'none' }}
        onClick={onClose}
      />
      <div
        className={'modal' + (open ? ' modal--in' : '')}
        style={{ display: open ? 'flex' : 'none', width: 680 }}
      >
        <div className="modal__head">
          <div>
            <div className="drawer__title">Record Transaction</div>
            <div className="drawer__sub">Log a sale or purchase and assign receipts</div>
          </div>
          <button className="iconbtn iconbtn--ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal__body">
          <Field label="Transaction Type">
            <div className="bigtoggle">
              <button
                className={'bigtoggle__opt bigtoggle__opt--sale' + (type === 'sale' ? ' is-on' : '')}
                onClick={() => setType('sale')}
              >
                <span className="bigtoggle__ico t-green">
                  <ArrowUpRight size={19} />
                </span>
                <span>
                  <b>Sale</b>
                  <span>Selling to a customer</span>
                </span>
              </button>
              <button
                className={'bigtoggle__opt bigtoggle__opt--buy' + (type === 'purchase' ? ' is-on' : '')}
                onClick={() => setType('purchase')}
              >
                <span className="bigtoggle__ico t-blue">
                  <ArrowDownRight size={19} />
                </span>
                <span>
                  <b>Purchase</b>
                  <span>Buying new stock</span>
                </span>
              </button>
            </div>
          </Field>

          <Field label="Product">
            <div className="input-wrap">
              <span className="input-wrap__ico">
                <Search size={17} />
              </span>
              <select
                className="select input--icon"
                value={pid}
                onChange={(e) => setPid(e.target.value)}
                style={{ appearance: 'auto' }}
              >
                <option value="" disabled>
                  Select a product…
                </option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.category}
                  </option>
                ))}
              </select>
            </div>
          </Field>

          <div className="field-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <Field label="Quantity">
              <input
                className="input tnum"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                inputMode="numeric"
                placeholder="0"
              />
            </Field>
            <Field label="Unit Price">
              <div className="input-wrap">
                <input
                  className="input tnum"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  inputMode="numeric"
                  placeholder="0"
                />
                <span className="input-affix">ETB</span>
              </div>
            </Field>
            <Field label="Discount">
              <div className="input-wrap">
                <input
                  className="input tnum"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  inputMode="numeric"
                />
                <span className="input-affix">ETB</span>
              </div>
            </Field>
          </div>

          <Field label="Notes" hint="Optional — reference, buyer, or memo">
            <textarea
              className="textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Monthly restock for Bole branch…"
            />
          </Field>

          {/* receipt splits */}
          <div
            style={{
              marginTop: 6,
              padding: 16,
              background: '#FCFDFE',
              border: '1px solid var(--border)',
              borderRadius: 12,
            }}
          >
            <div className="row between" style={{ marginBottom: 13 }}>
              <div className="row" style={{ gap: 9 }}>
                <span className="stat__ico t-amber" style={{ width: 32, height: 32 }}>
                  <Receipt size={17} />
                </span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>Receipt Splits</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    Assign each unit to a receipt for compliance
                  </div>
                </div>
              </div>
              <span className={'split-total' + (complete ? ' is-complete' : '')}>
                {complete ? <Check size={15} /> : <Receipt size={14} />}
                {assigned} of {qtyN || 0} assigned
              </span>
            </div>

            {splits.map((r) => (
              <div className="splitrow" key={r.id}>
                <input
                  className="input"
                  value={r.who}
                  onChange={(e) => setRow(r.id, 'who', e.target.value)}
                  placeholder="Receipt recipient / reference"
                  style={{ height: 40 }}
                />
                <div className="input-wrap">
                  <input
                    className="input tnum"
                    value={r.qty}
                    onChange={(e) => setRow(r.id, 'qty', e.target.value)}
                    placeholder="Qty"
                    inputMode="numeric"
                    style={{ height: 40 }}
                  />
                </div>
                <button
                  className="iconbtn"
                  style={{ width: 40, height: 40, color: 'var(--danger)' }}
                  onClick={() => delRow(r.id)}
                  title="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <button className="btn btn--ghost btn--sm" style={{ marginTop: 4 }} onClick={addRow}>
              <Plus size={16} />
              Add receipt split
            </button>
          </div>

          {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 12 }}>{error}</p>}
        </div>

        <div className="modal__foot">
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>
            Total&nbsp;
            <b className="tnum" style={{ color: 'var(--text)', fontSize: 15 }}>
              {fmt(total > 0 ? total : 0)} ETB
            </b>
          </div>
          <div className="row" style={{ gap: 10 }}>
            <button className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn--primary"
              onClick={save}
              disabled={!complete || createTransaction.isPending}
              style={{ opacity: complete && !createTransaction.isPending ? 1 : 0.55 }}
            >
              <Check size={17} />
              {createTransaction.isPending
                ? 'Saving…'
                : `Record ${type === 'sale' ? 'Sale' : 'Purchase'}`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
