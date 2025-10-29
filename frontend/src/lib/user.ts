import api from '@/lib/api';

export type Role = 'admin' | 'teacher' | 'student';
export interface Me {
  id: number;
  name: string;
  email: string;
  language_pref?: string | null;
  role: Role;
}

export async function fetchMe(): Promise<Me> {
  const { data } = await api.get('/api/auth/me');
  return data as Me;
}
