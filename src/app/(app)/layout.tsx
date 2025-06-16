'use client';
import { AppLayout as AuthenticatedAppLayout } from '@/components/layout/app-layout';
import { AuthGuard } from '@/components/auth-guard';
import React from 'react';

export default function AppPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <AuthenticatedAppLayout>{children}</AuthenticatedAppLayout>
    </AuthGuard>
  );
}
