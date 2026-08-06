import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { store } from "@/lib/store";
import type { Entry, FollowUpEntry, Profile } from "@/lib/types";

export function useEntries(): Entry[] {
  return useSyncExternalStore(store.subscribe, store.getEntries, store.getEntries);
}

export function useProfile(): Profile {
  return useSyncExternalStore(store.subscribe, store.getProfile, store.getProfile);
}

/** Entries recorded on a given calendar day (defaults to today), chronological. */
export function useEntriesForDay(date: Date = new Date()): Entry[] {
  const entries = useEntries();
  const key = date.toDateString();
  return entries.filter((e) => new Date(e.at).toDateString() === key);
}

/**
 * A ticking clock (ms) that re-renders on an interval so due-state can be
 * recomputed while the app is open. Prototype-friendly; no real notifications.
 */
export function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export interface OutstandingFollowUp {
  entry: FollowUpEntry;
  isDue: boolean;
}

/**
 * All incomplete follow-ups across every day (so one scheduled across midnight
 * doesn't vanish). Each is tagged due/upcoming based on the live clock.
 * Due-then-upcoming, each group ordered by scheduled time.
 */
export function useOutstandingFollowUps(): OutstandingFollowUp[] {
  const entries = useEntries();
  const now = useNow();
  return useMemo(() => {
    const followUps = entries.filter(
      (e): e is FollowUpEntry => e.kind === "followup" && !e.completed,
    );
    return followUps
      .map((entry) => ({
        entry,
        isDue: new Date(entry.scheduledFor).getTime() <= now,
      }))
      .sort((a, b) => {
        if (a.isDue !== b.isDue) return a.isDue ? -1 : 1;
        return (
          new Date(a.entry.scheduledFor).getTime() - new Date(b.entry.scheduledFor).getTime()
        );
      });
  }, [entries, now]);
}
