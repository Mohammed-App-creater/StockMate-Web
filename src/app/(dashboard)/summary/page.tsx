'use client';

import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Tag,
  Receipt,
  AlertTriangle,
} from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import {
  useDailySummary,
  useWeeklySummary,
  useMonthlySummary,
  useYearlySummary,
} from '@/hooks/useAnalytics';
import { formatMoney } from '@/lib/format';

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

const periods: { key: Period; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
];

export default function SummaryPage() {
  const [period, setPeriod] = useState<Period>('daily');

  const daily = useDailySummary();
  const weekly = useWeeklySummary();
  const monthly = useMonthlySummary();
  const yearly = useYearlySummary();

  const query =
    period === 'daily'
      ? daily
      : period === 'weekly'
      ? weekly
      : period === 'monthly'
      ? monthly
      : yearly;

  const { data, isLoading, isError } = query;

  const chartData =
    data?.top_products.slice(0, 5).map((p) => ({
      name: p.product_name,
      revenue: Number(p.revenue),
    })) ?? [];

  return (
    <div className="space-y-6">
      {/* Period tabs */}
      <div className="flex w-fit overflow-hidden rounded-lg border border-gray-200 bg-white">
        {periods.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              period === p.key
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-sm text-gray-500">Loading summary...</div>
      ) : isError || !data ? (
        <div className="rounded-xl bg-red-50 p-6 text-red-700">
          Failed to load summary data.
        </div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
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
              color={Number(data.net_profit) >= 0 ? 'green' : 'red'}
            />
            <StatsCard
              title="Discounts"
              value={formatMoney(data.total_discount)}
              icon={<Tag size={22} />}
              color="amber"
            />
            <StatsCard
              title="Transactions"
              value={data.total_transactions}
              icon={<Receipt size={22} />}
              color="blue"
            />
          </div>

          {/* Revenue chart */}
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Top 5 Products by Revenue
            </h2>
            {chartData.length === 0 ? (
              <p className="text-sm text-gray-500">No data to display.</p>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => formatMoney(Number(v))} />
                    <Bar dataKey="revenue" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Compliance */}
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Receipt Compliance
            </h2>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-gray-600">Compliance Rate</span>
              <span className="font-semibold text-gray-900">
                {data.receipt_compliance.compliance_rate_percent}%
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-green-500"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(0, Number(data.receipt_compliance.compliance_rate_percent))
                  )}%`,
                }}
              />
            </div>

            {data.receipt_compliance.risky_items.length > 0 && (
              <div className="mt-4 flex gap-3 rounded-lg bg-amber-50 p-4">
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Risky Items</p>
                  <ul className="mt-1 list-inside list-disc text-sm text-amber-700">
                    {data.receipt_compliance.risky_items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Low stock */}
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Low Stock</h2>
            {data.low_stock_products.length === 0 ? (
              <p className="text-sm text-gray-500">All products are well stocked.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.low_stock_products.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
                  >
                    <span className="font-medium text-gray-900">{p.name}</span>
                    <span className="font-semibold text-red-600">
                      {p.current_stock} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
