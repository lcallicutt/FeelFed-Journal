// Thin client for syncing journal entries with the API server.
// The API server is a separate artifact mounted at /api behind the same proxy.

import type { Entry } from "./types";

const API_BASE = "/api";
const DEVICE_ID_KEY = "feelfed:deviceId:v1";

function randomId(): string {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// If localStorage is unavailable, each client still gets its own random id,
// held in module memory for the session. Never a shared fallback value.
let sessionDeviceId: string | null = null;

export function getDeviceId(): string {
  if (sessionDeviceId) return sessionDeviceId;
  let id: string | null = null;
  try {
    id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = randomId();
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
  } catch {
    // Storage unavailable — fall through to a session-scoped random id.
  }
  sessionDeviceId = id ?? randomId();
  return sessionDeviceId;
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`API ${init?.method ?? "GET"} ${path} failed: ${res.status}`);
  }
  return res;
}

export async function fetchEntries(deviceId: string): Promise<Entry[]> {
  const res = await request(`/entries?deviceId=${encodeURIComponent(deviceId)}`);
  const body = (await res.json()) as { entries: Entry[] };
  return body.entries;
}

export async function pushEntry(deviceId: string, entry: Entry): Promise<void> {
  await request(`/entries`, {
    method: "PUT",
    body: JSON.stringify({ deviceId, entry }),
  });
}

export async function pushEntriesBulk(deviceId: string, entries: Entry[]): Promise<void> {
  await request(`/entries/bulk`, {
    method: "POST",
    body: JSON.stringify({ deviceId, entries }),
  });
}

export async function deleteEntryRemote(deviceId: string, entryId: string): Promise<void> {
  await request(`/entries/delete`, {
    method: "POST",
    body: JSON.stringify({ deviceId, entryId }),
  });
}
