'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';
import { useAuthStore } from '@/store/auth';
import { useCurrentUser } from '@/hooks/useUser';
import Sidebar from '@/components/Sidebar';
import Topbar, { TopbarSearch } from '@/components/Header';

function meta(pathname: string): { title: string; sub: string } {
  if (pathname.startsWith('/products'))
    return { title: 'Products', sub: 'Manage your inventory items' };
  if (pathname.startsWith('/transactions'))
    return { title: 'Transactions', sub: 'Sales, purchases & receipt compliance' };
  if (pathname.startsWith('/summary'))
    return { title: 'Summary', sub: 'Financial performance & analytics' };
  if (pathname.startsWith('/settings'))
    return { title: 'Settings', sub: 'Manage your account & security' };
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  return { title: 'Dashboard', sub: `${today} · Daily overview` };
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrate = useAuthStore((s) => s.hydrate);
  const [ready, setReady] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // load the logged-in user (GET /users/me) and keep the store in sync
  useCurrentUser();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/login');
      return;
    }
    hydrate();
    setReady(true);
  }, [router, hydrate]);

  if (!ready) return null;

  const { title, sub } = meta(pathname);
  const isDashboard = pathname === '/dashboard' || pathname.startsWith('/dashboard/');

  return (
    <div className="app">
      <Sidebar collapsed={collapsed} />
      <div className="app__main">
        <Topbar
          title={title}
          sub={sub}
          onToggle={() => setCollapsed((c) => !c)}
          actions={isDashboard ? <TopbarSearch /> : null}
        />
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
