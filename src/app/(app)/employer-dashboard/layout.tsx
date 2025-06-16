'use client';

import React from 'react';

export default function EmployerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Similar to SchoolDashboardLayout, the main (app)/layout.tsx currently handles
  // authentication and the main app shell.
  // Specifics for employer navigation or role checks will be added later.
  return <>{children}</>;
}
