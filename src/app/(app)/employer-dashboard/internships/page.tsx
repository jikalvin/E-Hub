"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EmployerInternshipsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/employer-dashboard/postings");
  }, [router]);
  return null;
} 