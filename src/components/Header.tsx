'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { Menu, Bell, Search } from '@/components/ui';

interface TopbarProps {
  title: string;
  sub?: string;
  onToggle: () => void;
  actions?: React.ReactNode;
}

function initials(fullName?: string, username?: string): string {
  const source = (fullName || username || '').trim();
  if (!source) return '–';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default function Topbar({ title, sub, onToggle, actions }: TopbarProps) {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="topbar">
      <button className="iconbtn iconbtn--ghost" onClick={onToggle} title="Toggle sidebar">
        <Menu size={20} />
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="topbar__title">{title}</div>
        {sub && <div className="topbar__sub">{sub}</div>}
      </div>
      <div className="row" style={{ gap: 10 }}>
        {actions}
        <button className="iconbtn bell-dot" title="Notifications">
          <Bell size={19} />
        </button>
        <Link
          href="/settings"
          className="row"
          style={{ gap: 10, paddingLeft: 6 }}
          title="Account settings"
        >
          <div className="avatar">{initials(user?.full_name, user?.username)}</div>
          <div style={{ lineHeight: 1.25 }} className="hide-sm">
            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>
              {user?.full_name ?? 'Loading…'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              {user ? `@${user.username}` : 'Account'}
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
}

/** Quick-search field used as a topbar action on the dashboard. */
export function TopbarSearch() {
  return (
    <div className="search hide-sm" style={{ width: 280, height: 38 }}>
      <Search size={17} color="var(--muted)" />
      <input placeholder="Quick search…" />
    </div>
  );
}
