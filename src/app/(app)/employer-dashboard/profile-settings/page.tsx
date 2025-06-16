"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EmployerProfileSettingsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/employer-dashboard/profile");
  }, [router]);
  return null;
} 