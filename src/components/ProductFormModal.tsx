'use client';

import { useEffect, useState } from 'react';
import {
  useCreateProduct,
  useUpdateProduct,
  type ProductInput,
} from '@/hooks/useProducts';
import type { Product } from '@/lib/types';
import { Field, X, Barcode, TrendingUp } from '@/components/ui';

interface ProductDrawerProps {
  open: boolean;
  product?: Product | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}

const UNITS: Product['unit'][] = ['kg', 'piece', 'box', 'liter'];

type FormState = {
  name: string;
  category: string;
  unit: Product['unit'];
  buy: string;
  sell: string;
  stock: string;
  barcode: string;
};

const blank = (): FormState => ({
  name: '',
  category: '',
  unit: 'piece',
  buy: '',
  sell: '',
  stock: '',
  barcode: '',
});

const fromProduct = (p: Product): FormState => ({
  name: p.name,
  category: p.category,
  unit: p.unit,
  buy: p.buying_price,
  sell: p.selling_price,
  stock: String(p.current_stock),
  barcode: p.barcode ?? '',
});

export default function ProductFormModal({
  open,
  product,
  onClose,
  onSaved,
}: ProductDrawerProps) {
  const isEdit = !!product;
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [f, setF] = useState<FormState>(blank());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setF(product ? fromProduct(product) : blank());
      setError(null);
    }
  }, [open, product]);

  const set =
    (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setF((prev) => ({ ...prev, [k]: e.target.value }));

  const buyN = Number(f.buy);
  const sellN = Number(f.sell);
  const margin = f.buy && f.sell && sellN > 0 ? Math.round(((sellN - buyN) / sellN) * 100) : null;
  const pending = createProduct.isPending || updateProduct.isPending;

  const save = async () => {
    setError(null);
    const payload: ProductInput = {
      name: f.name,
      category: f.category,
      unit: f.unit,
      buying_price: f.buy,
      selling_price: f.sell,
      barcode: f.barcode ? f.barcode : null,
      current_stock: Number(f.stock) || 0,
    };
    try {
      if (isEdit && product) {
        await updateProduct.mutateAsync({ id: product.id, input: payload });
      } else {
        await createProduct.mutateAsync(payload);
      }
      onClose();
      onSaved(isEdit ? 'Product updated' : 'Product added');
    } catch {
      setError('Failed to save product. Please try again.');
    }
  };

  return (
    <>
      <div
        className={'overlay' + (open ? ' overlay--in' : '')}
        style={{ display: open ? 'block' : 'none' }}
        onClick={onClose}
      />
      <aside className={'drawer' + (open ? ' drawer--in' : '')} aria-hidden={!open}>
        <div className="drawer__head">
          <div>
            <div className="drawer__title">{isEdit ? 'Edit Product' : 'Add New Product'}</div>
            <div className="drawer__sub">
              {isEdit ? 'Update details for this item' : 'Add an item to your inventory'}
            </div>
          </div>
          <button className="iconbtn iconbtn--ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="drawer__body">
          <Field label="Product Name">
            <input
              className="input"
              value={f.name}
              onChange={set('name')}
              placeholder="e.g. Sunflower Cooking Oil 5L"
            />
          </Field>

          <div className="field-grid">
            <Field label="Category">
              <input
                className="input"
                value={f.category}
                onChange={set('category')}
                placeholder="e.g. Cooking Oil"
              />
            </Field>
            <Field label="Unit">
              <select className="select" value={f.unit} onChange={set('unit')}>
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="field-grid">
            <Field label="Buy Price">
              <div className="input-wrap">
                <input
                  className="input tnum"
                  value={f.buy}
                  onChange={set('buy')}
                  placeholder="0"
                  inputMode="numeric"
                />
                <span className="input-affix">ETB</span>
              </div>
            </Field>
            <Field label="Sell Price">
              <div className="input-wrap">
                <input
                  className="input tnum"
                  value={f.sell}
                  onChange={set('sell')}
                  placeholder="0"
                  inputMode="numeric"
                />
                <span className="input-affix">ETB</span>
              </div>
            </Field>
          </div>

          {margin != null && (
            <div
              className="row"
              style={{ gap: 8, margin: '-4px 0 16px', fontSize: 13, color: 'var(--muted)' }}
            >
              <TrendingUp size={15} color="var(--success)" />
              Projected margin{' '}
              <b style={{ color: margin < 15 ? 'var(--danger)' : 'var(--success)' }}>{margin}%</b>
            </div>
          )}

          <div className="field-grid">
            <Field label="Stock Quantity">
              <input
                className="input tnum"
                value={f.stock}
                onChange={set('stock')}
                placeholder="0"
                inputMode="numeric"
              />
            </Field>
            <Field label="Barcode">
              <div className="input-wrap">
                <input
                  className="input tnum"
                  value={f.barcode}
                  onChange={set('barcode')}
                  placeholder="Scan or enter"
                />
                <span className="input-affix" style={{ color: 'var(--primary)' }}>
                  <Barcode size={18} />
                </span>
              </div>
            </Field>
          </div>

          {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>}
        </div>

        <div className="drawer__foot">
          <button className="btn btn--ghost" style={{ flex: 1 }} onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn--primary"
            style={{ flex: 1, opacity: pending ? 0.85 : 1 }}
            onClick={save}
            disabled={pending}
          >
            {pending ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </aside>
    </>
  );
}
