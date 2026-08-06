import type { Entry } from "./types";
import {
  AMOUNT_LABELS,
  HYDRATION_LABELS,
} from "./types";

export function timeOf(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Gentle "due in ~X" phrasing for an upcoming time. */
export function dueInLabel(iso: string, now: number = Date.now()): string {
  const diffMin = Math.round((new Date(iso).getTime() - now) / 60_000);
  if (diffMin <= 0) return "now";
  if (diffMin < 60) return `in about ${diffMin} min`;
  const hours = Math.round(diffMin / 60);
  return `in about ${hours} ${hours === 1 ? "hour" : "hours"}`;
}

export function dayLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function shortDay(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: "short", day: "numeric" });
}

/** Plain, non-judgmental one-line summary for a timeline row. */
export function summarize(entry: Entry): string {
  switch (entry.kind) {
    case "before":
      return `Checked in before eating · hunger ${entry.hunger}/10, feeling ${entry.mood.toLowerCase()}`;
    case "during":
      return `Ate ${AMOUNT_LABELS[entry.amount].toLowerCase()} · fullness ${entry.fullness}/10`;
    case "after":
      return `Reflected after eating · ${AMOUNT_LABELS[entry.amount].toLowerCase()}, fullness ${entry.fullness}/10`;
    case "hydration":
      return `Hydration · ${HYDRATION_LABELS[entry.status].toLowerCase()}`;
    case "energy":
      return `Energy · ${entry.level}/10`;
    case "movement":
      return `Movement · ${entry.activity.toLowerCase()}, ${entry.duration}`;
    case "followup":
      return entry.completed
        ? `Follow-up · fullness ${entry.fullness ?? "—"}/10`
        : `Follow-up scheduled`;
  }
}

export function entryTitle(kind: Entry["kind"]): string {
  switch (kind) {
    case "before":
      return "Before eating";
    case "during":
      return "During eating";
    case "after":
      return "After eating";
    case "hydration":
      return "Hydration";
    case "energy":
      return "Energy";
    case "movement":
      return "Movement";
    case "followup":
      return "Follow-up";
  }
}
