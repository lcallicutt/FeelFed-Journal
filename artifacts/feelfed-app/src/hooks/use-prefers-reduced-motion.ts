import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Tracks the OS "prefers-reduced-motion" setting and updates live when the
 * user toggles it mid-session (instead of a one-shot matchMedia check).
 */
export function usePrefersReducedMotion(): boolean {
  const [prefers, setPrefers] = useState<boolean>(
    () => typeof window !== "undefined" && window.matchMedia(QUERY).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const onChange = (e: MediaQueryListEvent) => setPrefers(e.matches);
    // Sync in case it changed between the initial render and the effect.
    setPrefers(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return prefers;
}
