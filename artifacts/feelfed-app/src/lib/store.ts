// A tiny in-memory store with subscribe/snapshot semantics so it can be
// consumed via useSyncExternalStore. Swap the internals for a real API/DB
// later without changing any screen. Seeded with realistic 14-day sample data.

import type { Entry, Profile } from "./types";
import {
  getDeviceId,
  fetchEntries,
  pushEntry,
  pushEntriesBulk,
  deleteEntryRemote,
} from "./api";

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
  reduceAnimations: false,
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

// ---- server sync ----
// localStorage stays the offline cache; the API server is the durable copy.
// On start we pull the server's journal (or seed it with local data if the
// server has none), and every create/update/delete is pushed in the background.
let deviceId = getDeviceId();

function sortByTime(list: Entry[]): Entry[] {
  return [...list].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}

// Mutations not yet acknowledged by the server (including ones made while
// the initial pull is in flight, or offline in a previous session) must
// never be clobbered by a server response. The dirty/tombstone sets are
// persisted and only cleared after the server confirms each push.
const PENDING_KEY = "feelfed:pendingSync:v1";
const savedPending = loadJSON<{ touched?: string[]; deleted?: string[] }>(PENDING_KEY);
const locallyTouched = new Set<string>(savedPending?.touched ?? []);
const locallyDeleted = new Set<string>(savedPending?.deleted ?? []);

function persistPending() {
  saveJSON(PENDING_KEY, {
    touched: [...locallyTouched],
    deleted: [...locallyDeleted],
  });
}

function markTouched(id: string) {
  locallyTouched.add(id);
  locallyDeleted.delete(id);
  persistPending();
}

function markDeleted(id: string) {
  locallyTouched.delete(id);
  locallyDeleted.add(id);
  persistPending();
}

/** Clear the dirty flag once the server confirmed this exact snapshot. */
function ackTouched(id: string, snapshot: Entry) {
  if (entries.find((e) => e.id === id) === snapshot) {
    locallyTouched.delete(id);
    persistPending();
  }
}

function ackDeleted(id: string) {
  locallyDeleted.delete(id);
  persistPending();
}

/**
 * Merge the server journal with the local cache. Deterministic rules:
 * - ids deleted locally this session stay deleted (the delete was pushed);
 * - ids created/updated locally this session win over the server copy;
 * - ids only the local cache knows (e.g. logged while offline) are kept
 *   and uploaded;
 * - for everything else the server copy wins.
 */
function mergeRemote(remote: Entry[]): { merged: Entry[]; localOnly: Entry[] } {
  const byId = new Map(remote.map((e) => [e.id, e] as const));
  for (const id of locallyDeleted) byId.delete(id);
  const localOnly: Entry[] = [];
  for (const e of entries) {
    if (locallyDeleted.has(e.id)) continue;
    if (locallyTouched.has(e.id) || !byId.has(e.id)) {
      byId.set(e.id, e);
      localOnly.push(e);
    }
  }
  return { merged: sortByTime([...byId.values()]), localOnly };
}

async function initialSync() {
  try {
    // Retry deletions that never reached the server (tombstones survive reloads).
    for (const id of [...locallyDeleted]) {
      await deleteEntryRemote(deviceId, id);
      ackDeleted(id);
    }
    const remote = await fetchEntries(deviceId);
    if (remote.length === 0) {
      if (entries.length > 0) {
        const snapshot = [...entries];
        await pushEntriesBulk(deviceId, snapshot);
        for (const e of snapshot) ackTouched(e.id, e);
      }
      return;
    }
    const { merged, localOnly } = mergeRemote(remote);
    entries = merged;
    // Keep the id counter ahead of any synced ids like "e1042".
    for (const e of entries) {
      const m = /^e(\d+)$/.exec(e.id);
      if (m && Number(m[1]) > idCounter) idCounter = Number(m[1]);
    }
    persistEntries();
    emit();
    if (localOnly.length > 0) {
      await pushEntriesBulk(deviceId, localOnly);
      for (const e of localOnly) ackTouched(e.id, e);
    }
  } catch (err) {
    console.warn("FeelFed: journal sync unavailable, working from local copy.", err);
  }
}
// All network sync operations run through one serial queue so requests can
// never arrive at the server out of order (an earlier, delayed PUT can no
// longer overwrite a later edit).
let syncQueue: Promise<void> = Promise.resolve();
function enqueueSync<T>(op: () => Promise<T>): Promise<T> {
  const run = syncQueue.then(op);
  syncQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function syncPush(op: () => Promise<void>) {
  enqueueSync(op).catch((err) => {
    console.warn("FeelFed: could not sync change to server.", err);
  });
}

void enqueueSync(initialSync);

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
    markTouched(entry.id);
    syncPush(async () => {
      await pushEntry(deviceId, entry);
      ackTouched(entry.id, entry);
    });
  },
  updateEntry(id: string, patch: Partial<Entry>) {
    entries = entries.map((e) => (e.id === id ? ({ ...e, ...patch } as Entry) : e));
    persistEntries();
    emit();
    markTouched(id);
    const updated = entries.find((e) => e.id === id);
    if (updated) {
      syncPush(async () => {
        await pushEntry(deviceId, updated);
        ackTouched(id, updated);
      });
    }
  },
  removeEntry(id: string) {
    entries = entries.filter((e) => e.id !== id);
    persistEntries();
    emit();
    markDeleted(id);
    syncPush(async () => {
      await deleteEntryRemote(deviceId, id);
      ackDeleted(id);
    });
  },
  setProfile(patch: Partial<Profile>) {
    profile = { ...profile, ...patch };
    saveJSON(PROFILE_KEY, profile);
    emit();
  },
  /** Code that identifies this journal on the server (shown in Settings). */
  getSyncCode(): string {
    return deviceId;
  },
  /**
   * Point this browser at an existing journal's sync code and pull it from
   * the server. If the server has no entries for that code yet, the local
   * journal is uploaded under it instead. Throws if the server is unreachable.
   */
  async linkSyncCode(code: string): Promise<number> {
    const trimmed = code.trim();
    if (!trimmed) throw new Error("Enter a sync code first.");
    return enqueueSync(async () => {
      const remote = await fetchEntries(trimmed);
      // Pending dirty flags/tombstones refer to the previous journal; they
      // must not carry over or they could edit/delete entries of the linked
      // journal that happen to share ids (e.g. seeded ids).
      locallyTouched.clear();
      locallyDeleted.clear();
      persistPending();
      deviceId = trimmed;
      try {
        localStorage.setItem("feelfed:deviceId:v1", trimmed);
      } catch {
        // Storage unavailable — the link lasts for this session only.
      }
      if (remote.length > 0) {
        entries = sortByTime(remote);
        persistEntries();
        emit();
      } else if (entries.length > 0) {
        await pushEntriesBulk(deviceId, entries);
      }
      return remote.length;
    });
  },
};
