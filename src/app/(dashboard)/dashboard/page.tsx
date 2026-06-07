'use client';

import { DollarSign, TrendingDown, TrendingUp, Receipt, AlertTriangle } from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import { useDailySummary } from '@/hooks/useAnalytics';
import { formatMoney } from '@/lib/format';

function SkeletonCards() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-24 animate-pulse rounded-xl bg-white shadow-sm ring-1 ring-gray-100"
        />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useDailySummary();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCards />
        <div className="h-64 animate-pulse rounded-xl bg-white shadow-sm ring-1 ring-gray-100" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-red-700">
        Failed to load dashboard data. Please try again later.
      </div>
    );
  }

  const netProfit = Number(data.net_profit);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Revenue"
          value={formatMoney(data.total_revenue)}
          icon={<DollarSign size={22} />}
          color="blue"
        />
        <StatsCard
          title="Cost"
          value={formatMoney(data.total_cost)}
          icon={<TrendingDown size={22} />}
          color="amber"
        />
        <StatsCard
          title="Net Profit"
          value={formatMoney(data.net_profit)}
          icon={<TrendingUp size={22} />}
          color={netProfit >= 0 ? 'green' : 'red'}
        />
        <StatsCard
          title="Transactions"
          value={data.total_transactions}
          icon={<Receipt size={22} />}
          color="blue"
        />
      </div>

      {/* Top products */}
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Top Products</h2>
        {data.top_products.length === 0 ? (
          <p className="text-sm text-gray-500">No sales recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 font-medium">Sold</th>
                  <th className="pb-2 font-medium">Revenue</th>
                  <th className="pb-2 font-medium">Margin</th>
                </tr>
              </thead>
              <tbody>
                {data.top_products.map((p) => (
                  <tr key={p.product_id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2 font-medium text-gray-900">{p.product_name}</td>
                    <td className="py-2 text-gray-600">{p.total_sold}</td>
                    <td className="py-2 text-gray-600">{formatMoney(p.revenue)}</td>
                    <td className="py-2 text-gray-600">{p.profit_margin_percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Low stock alert */}
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-500" />
          <h2 className="text-lg font-semibold text-gray-900">Low Stock Alert</h2>
        </div>
        {data.low_stock_products.length === 0 ? (
          <p className="text-sm text-gray-500">All products are well stocked.</p>
        ) : (
          <ul className="space-y-2">
            {data.low_stock_products.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-lg bg-red-50 px-4 py-2"
              >
                <span className="font-medium text-gray-900">{p.name}</span>
                <span className="font-semibold text-red-600">{p.current_stock} left</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
