"use client";

import { useSyncExternalStore } from "react";

const KEY = "hh.region";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("hh-region", onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener("hh-region", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function snapshot() {
  return localStorage.getItem(KEY) ?? "";
}

export function useRegion() {
  const id = useSyncExternalStore(subscribe, snapshot, () => "");

  function setRegion(next: string) {
    if (next) localStorage.setItem(KEY, next);
    else localStorage.removeItem(KEY);
    window.dispatchEvent(new Event("hh-region"));
  }

  return { id, setRegion };
}
