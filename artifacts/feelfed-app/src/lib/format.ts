import type { Entry, MomentEntry } from "./types";
import {
  AMOUNT_LABELS,
  HYDRATION_LABELS,
} from "./types";

/** Format a 0-10 value without a trailing ".0" (so 4 → "4", 6.5 → "6.5"). */
export function scaleValue(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

/**
 * Canonical Moment detail line, reused verbatim in Today, History and the
 * entry detail sheet: "Fullness 4/10 · Energy 6.5/10 · Hydration 7.5/10".
 */
export function momentDetail(entry: MomentEntry): string {
  return [
    `Fullness ${scaleValue(entry.fullness)}/10`,
    `Energy ${scaleValue(entry.energy)}/10`,
    `Hydration ${scaleValue(entry.hydration)}/10`,
  ].join(" · ");
}

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
    case "moment":
      return momentDetail(entry);
  }
}

/** Full label/value pairs for the entry detail sheet. */
export function entryFields(entry: Entry): { label: string; value: string }[] {
  switch (entry.kind) {
    case "before":
      return [
        { label: "Hunger", value: `${scaleValue(entry.hunger)}/10` },
        { label: "Energy", value: `${scaleValue(entry.energy)}/10` },
        { label: "Hydration", value: HYDRATION_LABELS[entry.hydration] },
        { label: "Since last ate", value: entry.timeSinceLastAte },
        { label: "Mood", value: entry.mood },
        { label: "Sensations", value: entry.sensations.join(", ") || "—" },
      ];
    case "during":
      return [
        { label: "Amount", value: AMOUNT_LABELS[entry.amount] },
        { label: "Fullness", value: `${scaleValue(entry.fullness)}/10` },
        { label: "Comfort", value: `${scaleValue(entry.comfort)}/10` },
      ];
    case "after":
      return [
        { label: "Amount", value: AMOUNT_LABELS[entry.amount] },
        { label: "Fullness", value: `${scaleValue(entry.fullness)}/10` },
        { label: "Satisfaction", value: `${scaleValue(entry.satisfaction)}/10` },
        { label: "Sensations", value: entry.sensations.join(", ") || "—" },
      ];
    case "hydration":
      return [{ label: "Hydration", value: HYDRATION_LABELS[entry.status] }];
    case "energy":
      return [{ label: "Energy", value: `${scaleValue(entry.level)}/10` }];
    case "movement":
      return [
        { label: "Activity", value: entry.activity },
        { label: "Duration", value: entry.duration },
      ];
    case "followup":
      return [
        { label: "Scheduled for", value: timeOf(entry.scheduledFor) },
        { label: "Status", value: entry.completed ? "Checked in" : "Not yet" },
        ...(entry.fullness != null
          ? [{ label: "Fullness", value: `${scaleValue(entry.fullness)}/10` }]
          : []),
      ];
    case "moment":
      return [
        { label: "Fullness", value: `${scaleValue(entry.fullness)}/10` },
        { label: "Energy", value: `${scaleValue(entry.energy)}/10` },
        { label: "Hydration", value: `${scaleValue(entry.hydration)}/10` },
      ];
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
    case "moment":
      return "Moment";
  }
}
