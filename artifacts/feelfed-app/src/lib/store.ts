// A tiny in-memory store with subscribe/snapshot semantics so it can be
// consumed via useSyncExternalStore. Swap the internals for a real API/DB
// later without changing any screen. Seeded with realistic 14-day sample data.

import type { Entry, Profile } from "./types";

let idCounter = 1000;
export function nextId(): string {
  idCounter += 1;
  return `e${idCounter}`;
}

// ---- seed helpers ----
function daysAgo(days: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function seedEntries(): Entry[] {
  const out: Entry[] = [];
  let n = 0;
  const id = () => `seed${n++}`;

  // Rich set for "today" so the timeline feels alive.
  out.push(
    {
      id: id(),
      kind: "hydration",
      at: daysAgo(0, 7, 40),
      status: "sips",
    },
    {
      id: id(),
      kind: "energy",
      at: daysAgo(0, 8, 0),
      level: 4,
    },
    {
      id: id(),
      kind: "before",
      at: daysAgo(0, 8, 15),
      hunger: 3,
      energy: 4,
      hydration: "sips",
      timeSinceLastAte: "Most of the day",
      mood: "Tired",
      sensations: ["No appetite", "Light"],
    },
    {
      id: id(),
      kind: "during",
      at: daysAgo(0, 8, 35),
      amount: "few-bites",
      fullness: 2,
      comfort: 6,
      pauseReminder: true,
    },
    {
      id: id(),
      kind: "after",
      at: daysAgo(0, 9, 5),
      amount: "few-bites",
      fullness: 3,
      satisfaction: 5,
      energyChange: "higher",
      sensations: ["Settled", "Warm"],
      texture: "soft",
      note: "Oatmeal. Four bites felt like enough today.",
    },
    {
      id: id(),
      kind: "movement",
      at: daysAgo(0, 11, 0),
      activity: "Gentle walk",
      duration: "10 min",
    },
    {
      id: id(),
      kind: "hydration",
      at: daysAgo(0, 12, 30),
      status: "steady",
    },
  );

  // Prior 13 days of lighter sample data — descriptive variety, no pattern implied.
  const amounts = ["few-bites", "quarter", "half", "all", "three-quarters"] as const;
  const textures = ["liquid", "blended", "soft", "solid"] as const;
  const moods = ["Calm", "Tired", "Content", "Anxious", "Okay", "Low"];
  for (let day = 1; day <= 13; day++) {
    // Some days have no appetite / smoothie-only days on purpose.
    const mealsToday = day % 5 === 0 ? 0 : (day % 3) + 1;

    out.push({
      id: id(),
      kind: "energy",
      at: daysAgo(day, 8, 30),
      level: (day * 3) % 8 + 1,
    });
    out.push({
      id: id(),
      kind: "hydration",
      at: daysAgo(day, 9, 0),
      status: (["not-yet", "sips", "steady", "well"] as const)[day % 4],
    });

    for (let m = 0; m < mealsToday; m++) {
      const amount = amounts[(day + m) % amounts.length];
      const texture = day % 4 === 0 ? "blended" : textures[(day + m) % textures.length];
      const hour = 8 + m * 5;
      out.push({
        id: id(),
        kind: "after",
        at: daysAgo(day, hour, 20),
        amount,
        fullness: ((day + m) % 6) + 2,
        satisfaction: ((day + m * 2) % 6) + 3,
        energyChange: (["lower", "same", "higher"] as const)[(day + m) % 3],
        sensations: [["Settled", "Comfortable", "Queasy", "Heavy", "Light"][(day + m) % 5]],
        texture,
      });
    }

    if (day % 4 === 1) {
      out.push({
        id: id(),
        kind: "movement",
        at: daysAgo(day, 17, 0),
        activity: ["Gentle walk", "Stretching", "Rest day", "Slow yoga"][day % 4],
        duration: ["10 min", "15 min", "5 min", "20 min"][day % 4],
      });
    }
    out.push({
      id: id(),
      kind: "before",
      at: daysAgo(day, 8, 10),
      hunger: (day * 2) % 9,
      energy: (day * 3) % 8 + 1,
      hydration: (["not-yet", "sips", "steady", "well"] as const)[day % 4],
      timeSinceLastAte: ["1-2 hours", "3-4 hours", "Most of the day", "5-6 hours"][day % 4],
      mood: moods[day % moods.length],
      sensations: [["Settled", "No appetite", "Queasy", "Light"][day % 4]],
    });
  }

  return out;
}

// ---- persistence (localStorage) ----
// Entries and profile survive refreshes/app closes. On first run we seed the
// sample data and persist it; afterwards localStorage is the source of truth.
const ENTRIES_KEY = "feelfed:entries:v1";
const PROFILE_KEY = "feelfed:profile:v1";
const ID_KEY = "feelfed:idCounter:v1";

function loadJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function saveJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode/quota) — keep working in-memory.
  }
}

const savedCounter = loadJSON<number>(ID_KEY);
if (typeof savedCounter === "number" && savedCounter > idCounter) {
  idCounter = savedCounter;
}

const DEFAULT_PROFILE: Profile = {
  name: "Sam",
  remindersEnabled: true,
  gentleNudges: true,
  privateMode: true,
};

const savedEntries = loadJSON<Entry[]>(ENTRIES_KEY);
let entries: Entry[] = Array.isArray(savedEntries) ? savedEntries : seedEntries();
let profile: Profile = { ...DEFAULT_PROFILE, ...(loadJSON<Partial<Profile>>(PROFILE_KEY) ?? {}) };

if (!Array.isArray(savedEntries)) {
  saveJSON(ENTRIES_KEY, entries);
}

function persistEntries() {
  saveJSON(ENTRIES_KEY, entries);
  saveJSON(ID_KEY, idCounter);
}

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

export const store = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getEntries(): Entry[] {
    return entries;
  },
  getProfile(): Profile {
    return profile;
  },
  addEntry(entry: Entry) {
    entries = [...entries, entry].sort(
      (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
    );
    persistEntries();
    emit();
  },
  updateEntry(id: string, patch: Partial<Entry>) {
    entries = entries.map((e) => (e.id === id ? ({ ...e, ...patch } as Entry) : e));
    persistEntries();
    emit();
  },
  removeEntry(id: string) {
    entries = entries.filter((e) => e.id !== id);
    persistEntries();
    emit();
  },
  setProfile(patch: Partial<Profile>) {
    profile = { ...profile, ...patch };
    saveJSON(PROFILE_KEY, profile);
    emit();
  },
};
