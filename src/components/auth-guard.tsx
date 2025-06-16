'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      // Store intended path to redirect after login
      if (pathname !== '/login' && pathname !== '/signup') {
         router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router, pathname]);

  if (loading || (!user && pathname !== '/login' && pathname !== '/signup' && pathname !== '/')) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="sr-only">Loading application...</p>
      </div>
    );
  }

  // If user is loaded and present, or if on a public page (though AuthGuard isn't typically for fully public pages)
  return <>{children}</>;
}
