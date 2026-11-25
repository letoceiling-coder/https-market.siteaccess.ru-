"use client";

import { useEffect } from "react";

export function useScrollMemory(key: string) {
  useEffect(() => {
    const stored = sessionStorage.getItem(key);
    if (stored) {
      const top = Number(stored);
      if (Number.isFinite(top)) window.scrollTo({ top, behavior: "instant" as ScrollBehavior });
    }
    function persist() {
      sessionStorage.setItem(key, String(window.scrollY));
    }
    window.addEventListener("pagehide", persist);
    return () => {
      persist();
      window.removeEventListener("pagehide", persist);
    };
  }, [key]);
}
