// app/ClientSideRouterHandler.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientSideRouterHandler() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dash');
  }, [router]);

  return null;
}