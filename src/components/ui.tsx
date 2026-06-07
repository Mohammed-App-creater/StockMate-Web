import React from 'react';

/* ===== Money formatting (ETB) ===== */
export const fmt = (v: string | number) =>
  Math.round(Number(v) || 0).toLocaleString('en-US');

export function Birr({ v, cls = '' }: { v: string | number; cls?: string }) {
  return (
    <span className={'tnum ' + cls}>
      {fmt(v)}
      <span className="stat__cur">ETB</span>
    </span>
  );
}

/* ===== Stat card ===== */
interface StatProps {
  label: string;
  value: string | number;
  tint?: 't-blue' | 't-green' | 't-red' | 't-amber' | 't-slate';
  icon: React.ReactNode;
  delta?: string;
  deltaDir?: 'up' | 'down';
  money?: boolean;
  valueColor?: string;
}

export function Stat({
  label,
  value,
  tint = 't-blue',
  icon,
  delta,
  deltaDir = 'up',
  money = true,
  valueColor,
}: StatProps) {
  return (
    <div className="stat">
      <div className="stat__top">
        <span className="stat__label">{label}</span>
        <span className={'stat__ico ' + tint}>{icon}</span>
      </div>
      <div className="stat__val tnum" style={valueColor ? { color: valueColor } : undefined}>
        {money ? (
          <>
            {fmt(value)}
            <span className="stat__cur">ETB</span>
          </>
        ) : (
          value
        )}
      </div>
      {delta != null && (
        <div className={'stat__delta ' + (deltaDir === 'up' ? 'up' : 'down')}>
          {deltaDir === 'up' ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
          {delta}
        </div>
      )}
    </div>
  );
}

/* ===== Badge ===== */
export function Badge({
  tone = 'slate',
  dot = false,
  children,
}: {
  tone?: 'green' | 'blue' | 'red' | 'amber' | 'slate';
  dot?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span className={'badge badge--' + tone + (dot ? ' badge--dot' : '')}>{children}</span>
  );
}

/* ===== Margin pill color logic ===== */
export function MarginCell({ pct }: { pct: number }) {
  let tone: 'green' | 'amber' | 'red' = 'green';
  if (pct < 15) tone = 'red';
  else if (pct < 30) tone = 'amber';
  const color =
    tone === 'green'
      ? 'var(--success)'
      : tone === 'amber'
      ? 'var(--warning)'
      : 'var(--danger)';
  return (
    <span className="pill-margin tnum" style={{ color }}>
      {pct}%
    </span>
  );
}

/* ===== Stock badge ===== */
export function StockBadge({ n }: { n: number }) {
  if (n < 10)
    return (
      <span className="badge badge--red">
        <AlertTriangle size={12} />
        {n}
      </span>
    );
  if (n < 30) return <span className="badge badge--amber">{n}</span>;
  return <span className="badge badge--slate">{n}</span>;
}

/* ===== Receipt split mini ===== */
export function SplitMini({ ok, total }: { ok: number; total: number }) {
  const bad = total - ok;
  return (
    <span className="split-mini">
      <span className="ok">
        {ok} <Check size={13} style={{ verticalAlign: '-2px' }} />
      </span>
      <span style={{ color: 'var(--border)' }}>·</span>
      <span className={bad > 0 ? 'no' : 'ok'}>
        {bad}{' '}
        {bad > 0 ? (
          <X size={13} style={{ verticalAlign: '-2px' }} />
        ) : (
          <Check size={13} style={{ verticalAlign: '-2px' }} />
        )}
      </span>
    </span>
  );
}

/* ===== Circular progress ring ===== */
export function Ring({ pct }: { pct: number }) {
  const R = 56;
  const C = 2 * Math.PI * R;
  const off = C * (1 - pct / 100);
  const color =
    pct >= 85 ? 'var(--success)' : pct >= 70 ? 'var(--warning)' : 'var(--danger)';
  return (
    <div className="ring">
      <svg width="132" height="132" viewBox="0 0 132 132">
        <circle cx="66" cy="66" r={R} fill="none" stroke="#EEF2F7" strokeWidth="12" />
        <circle
          cx="66"
          cy="66"
          r={R}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={off}
          transform="rotate(-90 66 66)"
          style={{ transition: 'stroke-dashoffset .9s cubic-bezier(.2,.7,.2,1)' }}
        />
      </svg>
      <div className="ring__center">
        <div>
          <div className="ring__pct tnum" style={{ color }}>
            {pct}%
          </div>
          <div className="ring__cap">Compliant</div>
        </div>
      </div>
    </div>
  );
}

/* ===== Skeletons ===== */
export function SkeletonStats({ n = 4 }: { n?: number }) {
  return (
    <div className={'stats' + (n === 5 ? ' stats--5' : '')}>
      {Array.from({ length: n }).map((_, i) => (
        <div className="stat" key={i}>
          <div className="stat__top">
            <div className="sk sk-line" style={{ width: '55%' }} />
            <div className="sk sk-circ" style={{ width: 36, height: 36 }} />
          </div>
          <div className="sk sk-line" style={{ width: '70%', height: 22, marginTop: 6 }} />
          <div className="sk sk-line" style={{ width: '40%', marginTop: 12 }} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <table className="tbl">
      <tbody>
        {Array.from({ length: rows }).map((_, r) => (
          <tr key={r}>
            {Array.from({ length: cols }).map((_, c) => (
              <td key={c}>
                <div
                  className="sk sk-line"
                  style={{ width: c === 0 ? '70%' : 50 + ((c * 7) % 30) + '%' }}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ===== Empty state ===== */
export function EmptyState({
  icon,
  title,
  msg,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  msg: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty">
      <div className="empty__art">{icon || <Package size={34} />}</div>
      <div className="empty__title">{title}</div>
      <div className="empty__msg">{msg}</div>
      {action}
    </div>
  );
}

/* ===== Form field ===== */
export function Field({
  label,
  hint,
  children,
}: {
  label?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      {label && <label className="field__label">{label}</label>}
      {children}
      {hint && <div className="field__hint">{hint}</div>}
    </div>
  );
}

/* ===== Toast ===== */
export function Toast({ children }: { children: React.ReactNode }) {
  return (
    <div className="toast">
      <Check size={17} color="#4ADE80" />
      {children}
    </div>
  );
}

/* re-export the icons used across the app from a single place */
export {
  Home,
  Box,
  ArrowRightLeft,
  BarChart3,
  LogOut,
  Search,
  Barcode,
  Plus,
  Pencil,
  Trash2,
  Bell,
  X,
  Check,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  Wallet,
  TrendingUp,
  Receipt,
  Menu,
  ChevronDown,
  Package,
  Lock,
  User,
  Eye,
  Filter,
  Calendar,
} from 'lucide-react';

import {
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  X,
  Package,
} from 'lucide-react';
