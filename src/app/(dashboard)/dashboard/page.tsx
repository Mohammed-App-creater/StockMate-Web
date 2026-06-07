'use client';

import { useDailySummary } from '@/hooks/useAnalytics';
import {
  Birr,
  Stat,
  MarginCell,
  SkeletonStats,
  SkeletonTable,
  Coins,
  Wallet,
  TrendingUp,
  ArrowRightLeft,
  AlertTriangle,
  Calendar,
} from '@/components/ui';

const initial = (name: string) => name.trim().charAt(0).toUpperCase() || '#';

export default function DashboardPage() {
  const { data, isLoading, isError } = useDailySummary();
  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (isError) {
    return (
      <div className="content__inner">
        <div className="card" style={{ padding: 24, color: 'var(--danger)' }}>
          Failed to load dashboard data. Please try again later.
        </div>
      </div>
    );
  }

  const lowStock = data?.low_stock_products ?? [];
  const top = data?.top_products ?? [];
  const netProfit = Number(data?.net_profit ?? 0);

  return (
    <div className="content__inner">
      {isLoading || !data ? (
        <SkeletonStats n={4} />
      ) : (
        <div className="stats">
          <Stat label="Total Revenue" value={data.total_revenue} tint="t-blue" icon={<Coins size={19} />} />
          <Stat label="Total Cost" value={data.total_cost} tint="t-slate" icon={<Wallet size={19} />} />
          <Stat
            label="Net Profit"
            value={data.net_profit}
            tint="t-green"
            icon={<TrendingUp size={19} />}
            valueColor={netProfit >= 0 ? 'var(--success)' : 'var(--danger)'}
          />
          <Stat
            label="Transactions"
            value={data.total_transactions}
            money={false}
            tint="t-amber"
            icon={<ArrowRightLeft size={19} />}
          />
        </div>
      )}

      <div className="grid-2 section-gap">
        {/* Top products */}
        <div className="card">
          <div className="card__head">
            <div>
              <div className="card__title">Top Products Today</div>
              <div className="card__sub">Best sellers ranked by revenue</div>
            </div>
            <span className="badge badge--slate">
              <Calendar size={13} />
              &nbsp;{today}
            </span>
          </div>
          {isLoading || !data ? (
            <SkeletonTable rows={5} cols={4} />
          ) : top.length === 0 ? (
            <div style={{ padding: 24, color: 'var(--muted)', fontSize: 13.5 }}>
              No sales recorded yet today.
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Product</th>
                  <th className="num">Units Sold</th>
                  <th className="num">Revenue</th>
                  <th className="num">Margin</th>
                </tr>
              </thead>
              <tbody>
                {top.map((p) => (
                  <tr key={p.product_id}>
                    <td>
                      <div className="prod-cell">
                        <span className="prod-thumb">{initial(p.product_name)}</span>
                        <div className="cell-strong">{p.product_name}</div>
                      </div>
                    </td>
                    <td className="num tnum cell-strong">{p.total_sold}</td>
                    <td className="num">
                      <Birr v={p.revenue} cls="cell-strong" />
                    </td>
                    <td className="num">
                      <MarginCell pct={Math.round(Number(p.profit_margin_percent))} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Low stock alert */}
        <div className="card" style={{ alignSelf: 'start' }}>
          <div className="card__head">
            <div>
              <div className="card__title">Low Stock Alert</div>
              <div className="card__sub">Below 10 units — reorder soon</div>
            </div>
            <span className="badge badge--red">
              <AlertTriangle size={13} />
              &nbsp;{lowStock.length}
            </span>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 11 }}>
            {isLoading || !data ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="alert-card"
                  style={{ background: '#F8FAFC', borderColor: 'var(--border)' }}
                >
                  <div className="sk sk-circ" style={{ width: 38, height: 38 }} />
                  <div style={{ flex: 1 }}>
                    <div className="sk sk-line" style={{ width: '60%' }} />
                    <div className="sk sk-line" style={{ width: '35%', marginTop: 7 }} />
                  </div>
                </div>
              ))
            ) : lowStock.length === 0 ? (
              <div style={{ padding: 8, color: 'var(--muted)', fontSize: 13.5 }}>
                All products are well stocked.
              </div>
            ) : (
              lowStock.map((p) => (
                <div className="alert-card" key={p.id}>
                  <span className="alert-card__ico">
                    <AlertTriangle size={19} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="alert-card__name">{p.name}</div>
                    <div className="alert-card__meta">
                      Only {p.current_stock} {p.unit}
                      {p.current_stock !== 1 ? 's' : ''} left · {p.category}
                    </div>
                  </div>
                  <button className="btn btn--ghost btn--sm">Reorder</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
