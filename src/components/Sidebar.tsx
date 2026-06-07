'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Home, Box, ArrowRightLeft, BarChart3, LogOut, Package } from '@/components/ui';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/products', label: 'Products', icon: Box },
  { href: '/transactions', label: 'Transactions', icon: ArrowRightLeft },
  { href: '/summary', label: 'Summary', icon: BarChart3 },
];

export default function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className={'sidebar' + (collapsed ? ' sidebar--collapsed' : '')}>
      <div className="sidebar__brand">
        <span className="sidebar__logo">
          <Package size={20} color="#fff" />
        </span>
        <span className="sidebar__wordmark">
          Stock<b>Mate</b>
        </span>
      </div>

      <div className="sidebar__section">Main Menu</div>
      <nav className="nav">
        {NAV_ITEMS.map((it) => {
          const Icon = it.icon;
          const active = pathname === it.href || pathname.startsWith(`${it.href}/`);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={'nav__item' + (active ? ' nav__item--active' : '')}
              title={it.label}
            >
              <Icon size={19} />
              <span className="nav__label">{it.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar__spacer" />
      <div className="sidebar__foot">
        <button className="nav__item" onClick={logout} title="Log out">
          <LogOut size={19} />
          <span className="nav__label">Log out</span>
        </button>
      </div>
    </aside>
  );
}
