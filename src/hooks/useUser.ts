import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { getToken } from '@/lib/auth';
import { useAuthStore } from '@/store/auth';
import type { User, UpdateUserRequest, ChangePasswordRequest } from '@/lib/types';

/** GET /users/me — fetches the logged-in user and syncs it into the auth store. */
export function useCurrentUser() {
  const setUser = useAuthStore((s) => s.setUser);
  const query = useQuery<User>({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const { data } = await api.get<User>('/users/me');
      return data;
    },
    enabled: typeof window !== 'undefined' && !!getToken(),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (query.data) setUser(query.data);
  }, [query.data, setUser]);

  return query;
}

/** PUT /users/me — update profile (full_name / username). */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: async (input: UpdateUserRequest) => {
      const { data } = await api.put<User>('/users/me', input);
      return data;
    },
    onSuccess: (data) => {
      setUser(data);
      queryClient.setQueryData(['user', 'me'], data);
    },
  });
}

/** POST /users/me/change-password */
export function useChangePassword() {
  return useMutation({
    mutationFn: async (input: ChangePasswordRequest) => {
      const { data } = await api.post<{ message: string }>(
        '/users/me/change-password',
        input
      );
      return data;
    },
  });
}
