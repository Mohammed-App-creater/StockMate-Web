import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { PeriodSummary } from '@/lib/types';

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

function useSummary(period: Period) {
  return useQuery<PeriodSummary>({
    queryKey: ['analytics', 'summary', period],
    queryFn: async () => {
      const { data } = await api.get<PeriodSummary>(
        `/analytics/summary/${period}`
      );
      return data;
    },
  });
}

export const useDailySummary = () => useSummary('daily');
export const useWeeklySummary = () => useSummary('weekly');
export const useMonthlySummary = () => useSummary('monthly');
export const useYearlySummary = () => useSummary('yearly');
