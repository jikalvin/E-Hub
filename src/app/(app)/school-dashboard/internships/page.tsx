"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InternshipsPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/school-dashboard/programs");
  }, [router]);
  return null;
} 