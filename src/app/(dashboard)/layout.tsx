'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';
import { useAuthStore } from '@/store/auth';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/products': 'Products',
  '/transactions': 'Transactions',
  '/summary': 'Summary',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrate = useAuthStore((s) => s.hydrate);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/login');
      return;
    }
    hydrate();
    setReady(true);
  }, [router, hydrate]);

  if (!ready) {
    return null;
  }

  const title =
    titles[Object.keys(titles).find((k) => pathname.startsWith(k)) ?? ''] ??
    'StockMate';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
