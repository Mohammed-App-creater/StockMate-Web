'use client';

import { LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const logout = useAuthStore((s) => s.logout);

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      <button
        onClick={logout}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-red-600"
      >
        <LogOut size={18} />
        Logout
      </button>
    </header>
  );
}
