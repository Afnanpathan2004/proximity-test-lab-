"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchMe, Me, Role } from '@/lib/user';

export default function RoleGate({ role, children }: { role: Role | Role[]; children: React.ReactNode }) {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const data = await fetchMe();
        const roles = Array.isArray(role) ? role : [role];
        if (!roles.includes(data.role)) {
          // redirect to the first requested role's login page
          router.replace(`/login/${roles[0]}`);
          return;
        }
        setMe(data);
      } catch {
        const roles = Array.isArray(role) ? role : [role];
        router.replace(`/login/${roles[0]}`);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [role, router]);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>;
  if (!me) return null;
  return <>{children}</>;
}
