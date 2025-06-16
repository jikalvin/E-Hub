"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SchoolProfileSettingsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/school-dashboard/profile");
  }, [router]);
  return null;
} 