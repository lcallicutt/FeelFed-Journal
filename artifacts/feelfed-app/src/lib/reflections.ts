// Gentle, descriptive copy mapping for the fullness-ring hero. Ported from the
// FeelFed marketing site so the app speaks in the same voice. No scores, no
// judgment — every combination is a valid thing to have recorded.

export type RingId = "fullness" | "energy" | "hydration";

export const FULLNESS_PHRASES = [
  "Running on empty", "Barely anything in", "Room to spare", "Softly satisfied", "Easing in",
  "Comfortably fed", "Noticing it now", "Getting close", "Full and floating", "Heavy but hopeful", "Past the ceiling",
];
export const ENERGY_PHRASES = [
  "Flat out", "Low battery", "Low battery, still showing up", "Slow start", "Finding it", "Steady",
  "Steady and warm", "Picking up", "Charged", "Charged and clear", "Fully lit",
];
export const HYDRATION_PHRASES = [
  "Running dry", "Barely a sip", "Dry and dusty", "Catching up",
  "Sipping along", "Topped up", "Hydrated and glowing", "Cool and clear",
];

export function fullnessPhrase(v: number): string {
  return FULLNESS_PHRASES[Math.max(0, Math.min(10, Math.round(v)))];
}
export function energyPhrase(v: number): string {
  return ENERGY_PHRASES[Math.max(0, Math.min(10, Math.round(v)))];
}
export function hydrationPhrase(v: number): string {
  const idx = Math.round((v / 10) * 7);
  return HYDRATION_PHRASES[Math.max(0, Math.min(7, idx))];
}

type Band = "L" | "M" | "H";
const band = (v: number): Band => (v <= 3 ? "L" : v <= 6 ? "M" : "H");
type LookupKey = `${Band},${Band},${Band}`;

export interface Reflection {
  title: string;
  body: string;
  next: string;
}

const LOOKUP: Partial<Record<LookupKey, Reflection>> = {
  "H,H,H": {
    title: "Nourished & charged.",
    body: "Comfortable fullness, strong hydration, and energy on the rise. This is the shape of a good day, and now it has a record.",
    next: "This may be a good moment for light movement—or simply enjoying how steady you feel.",
  },
  "H,H,L": {
    title: "Full & bright, running dry.",
    body: "Fullness and energy are up while hydration sits low. One thing at a time — that's still a record worth keeping.",
    next: "A slow glass of water would round this moment out nicely.",
  },
  "H,L,H": {
    title: "Fed & quiet.",
    body: "Fullness is high while energy sits low. That is a real combination, and it is written down now. Nothing here needs fixing today.",
    next: "Rest is allowed. Let the meal do its work for a while.",
  },
  "H,L,L": {
    title: "Quite full, quite depleted.",
    body: "Your body stored something today even if it didn't feel like enough. That counts.",
    next: "Maybe water and a soft pause before anything else.",
  },
  "H,M,M": {
    title: "Full & steady.",
    body: "A real baseline. The middle ground is underrated — this entry says you showed up somewhere solid.",
    next: "Nothing to change. Steady is worth noticing on its own.",
  },
  "M,H,H": {
    title: "Running well on not much.",
    body: "Energy and hydration are holding up. Some days efficiency is its own kind of nourishment.",
    next: "If appetite shows up later, it will find you ready.",
  },
  "M,H,L": {
    title: "Energised, running dry.",
    body: "Brilliant often comes before thirsty. A glass of water now would complete this picture.",
    next: "Try a few sips before the next thing on your list.",
  },
  "M,M,H": {
    title: "Balanced & hydrated.",
    body: "The quietest kind of good. Nothing dramatic in any direction — ordinary days are the ones that make a pattern readable.",
    next: "Carry on as you are. This is a fine place to be.",
  },
  "M,M,M": {
    title: "Four bites is still data.",
    body: "You showed up. Mid across the board means you're in the range where the body is just getting by — and that is enough to record.",
    next: "A stretch, a sip, or a snack — any small kindness fits here.",
  },
  "M,M,L": {
    title: "Middle of the road, a little dry.",
    body: "The entry is here either way. That is what the journal is for.",
    next: "Water first, everything else after.",
  },
  "M,L,H": {
    title: "Low battery, still showing up.",
    body: "Not much in, not much left over. Opening this on a day like today counts as the entry.",
    next: "Something small and easy to eat might meet you where you are.",
  },
  "M,L,L": {
    title: "Running low across the board.",
    body: "That's information, not failure. Some days the log is just a witness.",
    next: "Gentleness first — a sip of water, then whatever feels possible.",
  },
  "L,H,H": {
    title: "Light & clear.",
    body: "Sometimes this is exactly right. High energy on a light stomach can feel like the right kind of empty.",
    next: "Keep a small snack nearby for when the lightness fades.",
  },
  "L,H,L": {
    title: "Empty & buzzing.",
    body: "The kind of energy that burns fast. Your body is spending reserves it will want back later.",
    next: "Water and a few bites soon would soften the landing.",
  },
  "L,L,L": {
    title: "Everything at zero.",
    body: "This is where the journal starts, not ends. You opened it. That is the whole entry.",
    next: "No next step required. Being here was the step.",
  },
  "L,M,M": {
    title: "A little of everything.",
    body: "This is where gentle eating begins. No pressure, no grade. Just a starting point written down.",
    next: "If one small bite feels doable, that's a fine place to start.",
  },
  "L,M,H": {
    title: "Hydrated & waiting.",
    body: "Your body knows what comes next. Sometimes the drink comes before the food, and that is still a record.",
    next: "Food can follow whenever it's ready to.",
  },
  "L,L,H": {
    title: "Quiet & watered.",
    body: "Rest is data too.",
    next: "Stay soft with yourself. Nothing here is urgent.",
  },
};

const FALLBACK: Reflection = {
  title: "Four bites is still data.",
  body: "You showed up.",
  next: "Whatever comes next can be small.",
};

export function getReflection(fullness: number, energy: number, hydration: number): Reflection {
  const key: LookupKey = `${band(fullness)},${band(energy)},${band(hydration)}`;
  return LOOKUP[key] ?? FALLBACK;
}
