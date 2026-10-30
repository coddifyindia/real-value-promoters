"use client";

import { useCallback, useSyncExternalStore } from "react";
import { parseShortlist, toggleSlug } from "./shortlist-core";

const KEY = "rvp_shortlist";
const EVENT = "rvp-shortlist-change";
const EMPTY: string[] = [];

// localStorage is an external store: subscribe to it the way React expects,
// so every heart button and the header badge stay in sync (across tabs too).
let cachedRaw: string | null = null;
let cached: string[] = EMPTY;

function read(): string[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    // Storage blocked (private mode): the shortlist just won't persist.
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cached = parseShortlist(raw);
  }
  return cached;
}

function write(slugs: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(slugs));
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => e.key === KEY && onChange();
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function useShortlist() {
  // The server (and the first client render) sees an empty list, so the
  // prerendered HTML is identical for everyone and hydration never mismatches.
  const slugs = useSyncExternalStore(subscribe, read, () => EMPTY);
  const toggle = useCallback((slug: string) => write(toggleSlug(read(), slug)), []);
  const clear = useCallback(() => write([]), []);
  return { slugs, toggle, clear, has: (slug: string) => slugs.includes(slug) };
}
