'use client';

import { useEffect, useState } from 'react';
import {
  useDailySummary,
  useWeeklySummary,
  useMonthlySummary,
  useYearlySummary,
} from '@/hooks/useAnalytics';
import {
  fmt,
  Stat,
  Ring,
  Badge,
  SkeletonStats,
  SkeletonTable,
  Coins,
  Wallet,
  TrendingUp,
  ArrowRightLeft,
  BarChart3,
  AlertTriangle,
  Calendar,
} from '@/components/ui';

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

const periods: { id: Period; label: string }[] = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
];

export default function SummaryPage() {
  const [period, setPeriod] = useState<Period>('daily');
  const [drawn, setDrawn] = useState(false);

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

  // animate the bars in whenever the period changes or data arrives
  useEffect(() => {
    setDrawn(false);
    const t = setTimeout(() => setDrawn(true), 60);
    return () => clearTimeout(t);
  }, [period, isLoading]);

  const chartData = (data?.top_products ?? [])
    .slice(0, 5)
    .map((p) => ({ name: p.product_name, revenue: Number(p.revenue) }));
  const maxRev = Math.max(1, ...chartData.map((d) => d.revenue));
  const compliance = Math.round(Number(data?.receipt_compliance?.compliance_rate_percent ?? 0));
  const risky = data?.receipt_compliance?.risky_items ?? [];

  return (
    <div className="content__inner">
      <div className="pagehead">
        <div className="pills">
          {periods.map((p) => (
            <button
              key={p.id}
              className={'pill' + (period === p.id ? ' pill--active' : '')}
              onClick={() => setPeriod(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <button className="btn btn--ghost">
          <Calendar size={17} />
          Export report
        </button>
      </div>

      {isError ? (
        <div className="card" style={{ padding: 24, color: 'var(--danger)' }}>
          Failed to load summary data.
        </div>
      ) : (
        <>
          {isLoading || !data ? (
            <SkeletonStats n={4} />
          ) : (
            <div className="stats">
              <Stat label="Revenue" value={data.total_revenue} tint="t-blue" icon={<Coins size={19} />} />
              <Stat label="Cost of Goods" value={data.total_cost} tint="t-slate" icon={<Wallet size={19} />} />
              <Stat
                label="Net Profit"
                value={data.net_profit}
                tint="t-green"
                icon={<TrendingUp size={19} />}
                valueColor={Number(data.net_profit) >= 0 ? 'var(--success)' : 'var(--danger)'}
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
            {/* revenue chart */}
            <div className="card">
              <div className="card__head">
                <div>
                  <div className="card__title">Revenue by Product</div>
                  <div className="card__sub">Top performers this period</div>
                </div>
                <span className="badge badge--blue">
                  <BarChart3 size={13} />
                  &nbsp;Top 5
                </span>
              </div>
              <div style={{ padding: '26px 22px 22px' }}>
                {isLoading || !data ? (
                  <div className="row" style={{ alignItems: 'flex-end', gap: 22, height: 260 }}>
                    {[60, 90, 50, 75, 40].map((h, i) => (
                      <div key={i} className="sk" style={{ flex: 1, height: h + '%', borderRadius: 8 }} />
                    ))}
                  </div>
                ) : chartData.length === 0 ? (
                  <div style={{ color: 'var(--muted)', fontSize: 13.5 }}>No revenue data for this period.</div>
                ) : (
                  <div className="chart">
                    {chartData.map((d, i) => (
                      <div className="chart__col" key={i}>
                        <div className="chart__bar-wrap">
                          <div
                            className="chart__bar"
                            style={{ height: drawn ? (d.revenue / maxRev) * 100 + '%' : '0%' }}
                          >
                            <span className="chart__val">{fmt(d.revenue)}</span>
                          </div>
                        </div>
                        <div className="chart__lbl">{d.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* compliance */}
            <div className="card" style={{ alignSelf: 'start' }}>
              <div className="card__head">
                <div>
                  <div className="card__title">Receipt Compliance</div>
                  <div className="card__sub">Units with valid receipts</div>
                </div>
              </div>
              <div style={{ padding: '24px 22px' }}>
                <div className="ring-wrap">
                  {isLoading || !data ? (
                    <div className="sk sk-circ" style={{ width: 132, height: 132 }} />
                  ) : (
                    <Ring pct={compliance} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.55 }}>
                      <b style={{ color: 'var(--text)' }}>{compliance}%</b> of sold units have a
                      matching receipt assigned. The rest are flagged for review.
                    </div>
                    <div className="row" style={{ gap: 16, marginTop: 16 }}>
                      <div>
                        <div className="row" style={{ gap: 7 }}>
                          <span style={{ width: 9, height: 9, borderRadius: 3, background: 'var(--success)' }} />
                          <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>Compliant</span>
                        </div>
                        <div className="tnum" style={{ fontSize: 18, fontWeight: 700, marginTop: 3 }}>
                          {compliance}%
                        </div>
                      </div>
                      <div>
                        <div className="row" style={{ gap: 7 }}>
                          <span style={{ width: 9, height: 9, borderRadius: 3, background: 'var(--danger)' }} />
                          <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>Flagged</span>
                        </div>
                        <div className="tnum" style={{ fontSize: 18, fontWeight: 700, marginTop: 3 }}>
                          {100 - compliance}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* risky items */}
          <div className="card section-gap">
            <div className="card__head">
              <div>
                <div className="card__title">Items Needing Receipts</div>
                <div className="card__sub">
                  Transactions with unassigned units — resolve for full compliance
                </div>
              </div>
              <span className="badge badge--amber">
                <AlertTriangle size={13} />
                &nbsp;{risky.length} flagged
              </span>
            </div>
            {isLoading || !data ? (
              <SkeletonTable rows={4} cols={3} />
            ) : risky.length === 0 ? (
              <div style={{ padding: 24, color: 'var(--muted)', fontSize: 13.5 }}>
                No flagged items — all sold units have receipts assigned.
              </div>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {risky.map((name, i) => (
                    <tr key={i}>
                      <td className="cell-strong">{name}</td>
                      <td>
                        <Badge tone="red" dot>
                          Needs receipt
                        </Badge>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn--ghost btn--sm">Assign receipts</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
