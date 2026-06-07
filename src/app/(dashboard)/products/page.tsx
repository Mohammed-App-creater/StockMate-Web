'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useProducts, useSearchProducts, useDeleteProduct } from '@/hooks/useProducts';
import { useDebounce } from '@/hooks/useDebounce';
import ProductFormModal from '@/components/ProductFormModal';
import { formatMoney } from '@/lib/format';
import type { Product } from '@/lib/types';

export default function ProductsPage() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const isSearching = debouncedQuery.trim().length > 0;

  const allProducts = useProducts();
  const searchResults = useSearchProducts(debouncedQuery);
  const deleteProduct = useDeleteProduct();

  const products = isSearching ? searchResults.data : allProducts.data;
  const isLoading = isSearching ? searchResults.isLoading : allProducts.isLoading;
  const isError = isSearching ? searchResults.isError : allProducts.isError;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | undefined>(undefined);

  const openAdd = () => {
    setEditing(undefined);
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setModalOpen(true);
  };

  const handleDelete = async (product: Product) => {
    if (window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      await deleteProduct.mutateAsync(product.id);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
        {isLoading ? (
          <div className="p-6 text-sm text-gray-500">Loading products...</div>
        ) : isError ? (
          <div className="p-6 text-sm text-red-600">Failed to load products.</div>
        ) : !products || products.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">No products found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Unit</th>
                  <th className="px-4 py-3 font-medium">Buying</th>
                  <th className="px-4 py-3 font-medium">Selling</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Barcode</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-3 text-gray-600">{p.category}</td>
                    <td className="px-4 py-3 text-gray-600">{p.unit}</td>
                    <td className="px-4 py-3 text-gray-600">{formatMoney(p.buying_price)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatMoney(p.selling_price)}</td>
                    <td
                      className={`px-4 py-3 font-medium ${
                        p.current_stock < 10 ? 'text-red-600' : 'text-gray-600'
                      }`}
                    >
                      {p.current_stock}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.barcode ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                          aria-label="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          aria-label="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <ProductFormModal product={editing} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}
