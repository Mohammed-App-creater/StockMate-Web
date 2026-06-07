'use client';

import React from 'react';
import { Menu, Bell, Search } from '@/components/ui';

interface TopbarProps {
  title: string;
  sub?: string;
  onToggle: () => void;
  actions?: React.ReactNode;
}

export default function Topbar({ title, sub, onToggle, actions }: TopbarProps) {
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
        <div className="row" style={{ gap: 10, paddingLeft: 6 }}>
          <div className="avatar">AT</div>
          <div style={{ lineHeight: 1.25 }} className="hide-sm">
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>Abenezer T.</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Senior Accountant</div>
          </div>
        </div>
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
