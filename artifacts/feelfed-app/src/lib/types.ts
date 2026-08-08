// FeelFed domain types. Structured so a real API/DB can be wired in later
// without redesigning screens: every entry has id + isoTimestamp + kind.

export type AmountEaten = "few-bites" | "quarter" | "half" | "three-quarters" | "all";
export type HydrationStatus = "not-yet" | "sips" | "steady" | "well";
export type FoodTexture = "liquid" | "blended" | "soft" | "solid";
export type FollowUpMinutes = 30 | 45 | 60 | 90;

export type EntryKind =
  | "before"
  | "during"
  | "after"
  | "hydration"
  | "energy"
  | "movement"
  | "followup"
  | "moment";

export interface BaseEntry {
  id: string;
  kind: EntryKind;
  /** ISO timestamp of when this was recorded */
  at: string;
  note?: string;
}

export interface BeforeEntry extends BaseEntry {
  kind: "before";
  hunger: number; // 0-10
  energy: number; // 0-10
  hydration: HydrationStatus;
  timeSinceLastAte: string; // e.g. "3-4 hours"
  mood: string;
  sensations: string[];
}

export interface DuringEntry extends BaseEntry {
  kind: "during";
  amount: AmountEaten;
  fullness: number; // 0-10
  comfort: number; // 0-10
  pauseReminder: boolean;
}

export interface AfterEntry extends BaseEntry {
  kind: "after";
  amount: AmountEaten;
  fullness: number; // 0-10
  satisfaction: number; // 0-10
  energyChange: "lower" | "same" | "higher";
  sensations: string[];
  texture: FoodTexture;
  followUpMinutes?: FollowUpMinutes;
}

export interface HydrationEntry extends BaseEntry {
  kind: "hydration";
  status: HydrationStatus;
}

export interface EnergyEntry extends BaseEntry {
  kind: "energy";
  level: number; // 0-10
}

export interface MovementEntry extends BaseEntry {
  kind: "movement";
  activity: string;
  duration: string; // e.g. "10 min"
}

export interface FollowUpEntry extends BaseEntry {
  kind: "followup";
  scheduledFor: string; // ISO
  relatesToAfterId?: string;
  completed: boolean;
  fullness?: number;
  energy?: number;
  sensations?: string[];
}

/** A quick "how am I right now" snapshot from the fullness-ring hero. */
export interface MomentEntry extends BaseEntry {
  kind: "moment";
  fullness: number; // 0-10
  energy: number; // 0-10
  hydration: number; // 0-10
  reflection: string;
}

export type Entry =
  | BeforeEntry
  | DuringEntry
  | AfterEntry
  | HydrationEntry
  | EnergyEntry
  | MovementEntry
  | FollowUpEntry
  | MomentEntry;

export interface Profile {
  name: string;
  remindersEnabled: boolean;
  gentleNudges: boolean;
  privateMode: boolean;
  /** Turn off decorative/ambient animations (calmer screen, easier on battery). */
  reduceAnimations: boolean;
}

// ---- Display helpers (plain, supportive language — no judgment) ----

export const AMOUNT_LABELS: Record<AmountEaten, string> = {
  "few-bites": "A few bites",
  quarter: "About a quarter",
  half: "About half",
  "three-quarters": "About three quarters",
  all: "All of it",
};

export const AMOUNT_ORDER: AmountEaten[] = [
  "few-bites",
  "quarter",
  "half",
  "three-quarters",
  "all",
];

export const HYDRATION_LABELS: Record<HydrationStatus, string> = {
  "not-yet": "Haven't yet",
  sips: "A few sips",
  steady: "Sipping steadily",
  well: "Well hydrated",
};

export const TEXTURE_LABELS: Record<FoodTexture, string> = {
  liquid: "Liquid",
  blended: "Blended",
  soft: "Soft",
  solid: "Solid",
};

export const ENERGY_CHANGE_LABELS: Record<AfterEntry["energyChange"], string> = {
  lower: "A little lower",
  same: "About the same",
  higher: "A little higher",
};

export const MOOD_OPTIONS = [
  "Calm",
  "Content",
  "Tired",
  "Anxious",
  "Low",
  "Rushed",
  "Numb",
  "Okay",
];

export const SENSATION_OPTIONS = [
  "Settled",
  "Queasy",
  "Bloated",
  "Light",
  "Heavy",
  "Warm",
  "Shaky",
  "No appetite",
  "Cramping",
  "Comfortable",
];

export const TIME_SINCE_OPTIONS = [
  "Under 1 hour",
  "1-2 hours",
  "3-4 hours",
  "5-6 hours",
  "Most of the day",
  "Not sure",
];
