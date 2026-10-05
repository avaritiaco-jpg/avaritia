"use client";

import { useSyncExternalStore } from "react";

/** Media query reativa. No HTML estático assume `false` (layout mobile primeiro). */
export function useMedia(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => matchMedia(query).matches,
    () => false,
  );
}
