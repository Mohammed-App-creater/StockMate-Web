import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'green' | 'red' | 'blue' | 'amber';
}

const colorMap: Record<NonNullable<StatsCardProps['color']>, { bg: string; text: string }> = {
  green: { bg: 'bg-green-100', text: 'text-green-600' },
  red: { bg: 'bg-red-100', text: 'text-red-600' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
};

export default function StatsCard({ title, value, icon, color = 'blue' }: StatsCardProps) {
  const c = colorMap[color];
  return (
    <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${c.bg} ${c.text}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className={`truncate text-2xl font-bold ${c.text}`}>{value}</p>
      </div>
    </div>
  );
}
