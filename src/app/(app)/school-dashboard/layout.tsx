'use client'; // Required because AuthGuard and AppLayout likely use client-side features

import React from 'react';
// We'll use the main app layout for now, which includes AuthGuard.
// Later, we can customize this if school dashboard needs a different overall structure
// or more specific role checking within this layout.
// import { AppLayout as AuthenticatedAppLayout } from '@/components/layout/app-layout';
// import { AuthGuard } from '@/components/auth-guard'; // Already part of (app) layout

// For now, this layout doesn't need to do much more than what the root (app) layout provides.
// The root (app) layout already has AuthGuard.
// We will add role-specific logic and navigation here or in app-layout later.

export default function SchoolDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // At this stage, the main (app)/layout.tsx handles authentication via AuthGuard
  // and provides the overall AuthenticatedAppLayout.
  // We might add specific role checks or a different sidebar navigation here later.
  // For now, just render children.
  return <>{children}</>;
}
