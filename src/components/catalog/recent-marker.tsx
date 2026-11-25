"use client";

import { useEffect } from "react";
import { rememberRecent } from "@/hooks/storage";

export function RecentMarker({ id }: { id: string }) {
  useEffect(() => {
    rememberRecent(id);
  }, [id]);
  return null;
}
