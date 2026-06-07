'use client';

import { useState } from 'react';
import { useProducts, useSearchProducts, useDeleteProduct } from '@/hooks/useProducts';
import { useDebounce } from '@/hooks/useDebounce';
import ProductFormModal from '@/components/ProductFormModal';
import type { Product } from '@/lib/types';
import {
  fmt,
  StockBadge,
  SkeletonTable,
  EmptyState,
  Toast,
  Search,
  Barcode,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
} from '@/components/ui';

const initial = (name: string) => name.trim().charAt(0).toUpperCase() || '#';

export default function ProductsPage() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const isSearching = debouncedQuery.trim().length > 0;

  const allProducts = useProducts();
  const searchResults = useSearchProducts(debouncedQuery);
  const deleteProduct = useDeleteProduct();

  const products = (isSearching ? searchResults.data : allProducts.data) ?? [];
  const isLoading = isSearching ? searchResults.isLoading : allProducts.isLoading;

  const [drawer, setDrawer] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const lowCount = products.filter((p) => p.current_stock < 10).length;

  const openAdd = () => {
    setEditing(null);
    setDrawer(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    setDrawer(true);
  };
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };
  const remove = async (p: Product) => {
    if (window.confirm(`Delete "${p.name}"? This cannot be undone.`)) {
      await deleteProduct.mutateAsync(p.id);
      showToast('Product deleted');
    }
  };

  return (
    <div className="content__inner">
      <div className="pagehead">
        <div className="search" style={{ width: 380, maxWidth: '100%' }}>
          <Search size={18} color="var(--muted)" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, category, barcode…"
          />
          <button className="search__barcode" title="Scan barcode">
            <Barcode size={20} />
          </button>
        </div>
        <button className="btn btn--primary" onClick={openAdd}>
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="card">
        <div className="card__head">
          <div>
            <div className="card__title">All Products</div>
            <div className="card__sub">
              {isLoading ? 'Loading…' : `${products.length} items in inventory`}
            </div>
          </div>
          <span className="badge badge--red">
            <AlertTriangle size={12} />
            &nbsp;{lowCount} low stock
          </span>
        </div>

        {isLoading ? (
          <SkeletonTable rows={7} cols={8} />
        ) : products.length === 0 ? (
          <EmptyState
            icon={<Search size={32} />}
            title="No products found"
            msg={
              isSearching
                ? `Nothing matches “${debouncedQuery}”. Try a different name, category, or barcode.`
                : 'Add your first product to start tracking inventory.'
            }
            action={
              isSearching ? (
                <button className="btn btn--ghost" onClick={() => setQuery('')}>
                  Clear search
                </button>
              ) : (
                <button className="btn btn--primary" onClick={openAdd}>
                  <Plus size={18} />
                  Add Product
                </button>
              )
            }
          />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Unit</th>
                <th className="num">Buy</th>
                <th className="num">Sell</th>
                <th className="num">Stock</th>
                <th>Barcode</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="prod-cell">
                      <span className="prod-thumb">{initial(p.name)}</span>
                      <div className="cell-strong">{p.name}</div>
                    </div>
                  </td>
                  <td className="cell-muted">{p.category}</td>
                  <td className="cell-muted">{p.unit}</td>
                  <td className="num tnum">{fmt(p.buying_price)}</td>
                  <td className="num tnum cell-strong">{fmt(p.selling_price)}</td>
                  <td className="num">
                    <StockBadge n={p.current_stock} />
                  </td>
                  <td className="cell-muted tnum" style={{ fontSize: 12.5 }}>
                    {p.barcode ?? '—'}
                  </td>
                  <td>
                    <div className="row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        className="iconbtn"
                        style={{ width: 32, height: 32 }}
                        onClick={() => openEdit(p)}
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="iconbtn"
                        style={{ width: 32, height: 32, color: 'var(--danger)' }}
                        onClick={() => remove(p)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ProductFormModal
        open={drawer}
        product={editing}
        onClose={() => setDrawer(false)}
        onSaved={showToast}
      />
      {toast && <Toast>{toast}</Toast>}
    </div>
  );
}
