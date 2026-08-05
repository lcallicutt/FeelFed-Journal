import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Button } from "@workspace/feelfed-ds/components/ui/button";
import { useSaveMoment } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMomentsQueryKey } from "@workspace/api-client-react";
import { getDeviceId } from "@/lib/deviceId";

const TEAL = "#3A8F88";
const DEEP_TEAL = "#1F4E49";

interface ReflectionCardProps {
  fullness: number;
  energy: number;
  hydration: number;
}

type Band = "L" | "M" | "H";
const band = (v: number): Band => (v <= 3 ? "L" : v <= 6 ? "M" : "H");
type LookupKey = `${Band},${Band},${Band}`;

interface Reflection {
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

export default function ReflectionCard({ fullness, energy, hydration }: ReflectionCardProps) {
  const [displayedTitle, setDisplayedTitle] = useState("");
  const [bodyVisible, setBodyVisible] = useState(false);
  const [sheen, setSheen] = useState(false);
  const [saved, setSaved] = useState(false);

  const typewriterRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sheenTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTypeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bodyRevealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Guard: only re-type when the target text actually changes
  const lastTitleRef = useRef("");

  const queryClient = useQueryClient();
  const { mutate: saveMoment, isPending } = useSaveMoment({
    mutation: {
      onSuccess: () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        queryClient.invalidateQueries({
          queryKey: getGetMomentsQueryKey({ deviceId: getDeviceId() }),
        });
      },
    },
  });

  const reflection = useMemo<Reflection>(() => {
    const key: LookupKey = `${band(fullness)},${band(energy)},${band(hydration)}`;
    return LOOKUP[key] ?? FALLBACK;
  }, [fullness, energy, hydration]);

  const startSequence = useCallback((title: string) => {
    // Clear any in-flight timers
    if (typewriterRef.current)  clearTimeout(typewriterRef.current);
    if (sheenTimerRef.current)  clearTimeout(sheenTimerRef.current);
    if (startTypeTimer.current) clearTimeout(startTypeTimer.current);
    if (bodyRevealTimer.current) clearTimeout(bodyRevealTimer.current);

    setDisplayedTitle("");
    setBodyVisible(false);
    setSheen(true);
    sheenTimerRef.current = setTimeout(() => setSheen(false), 350);

    startTypeTimer.current = setTimeout(() => {
      let i = 0;
      const type = () => {
        i++;
        setDisplayedTitle(title.slice(0, i));
        if (i < title.length) {
          typewriterRef.current = setTimeout(type, 34);
        } else {
          bodyRevealTimer.current = setTimeout(() => setBodyVisible(true), 120);
        }
      };
      type();
    }, 200);
  }, []);

  // Re-trigger typewriter only when the title actually changes
  useEffect(() => {
    if (reflection.title === lastTitleRef.current) return;
    lastTitleRef.current = reflection.title;
    startSequence(reflection.title);
  }, [reflection.title, startSequence]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typewriterRef.current)  clearTimeout(typewriterRef.current);
      if (sheenTimerRef.current)  clearTimeout(sheenTimerRef.current);
      if (startTypeTimer.current) clearTimeout(startTypeTimer.current);
      if (bodyRevealTimer.current) clearTimeout(bodyRevealTimer.current);
    };
  }, []);

  const handleSave = useCallback(() => {
    saveMoment({
      data: {
        deviceId: getDeviceId(),
        fullness,
        energy,
        hydration,
        reflection: `${reflection.title} ${reflection.body}`,
      },
    });
  }, [saveMoment, fullness, energy, hydration, reflection]);

  // Card glow follows overall state — warmer/brighter the higher things are
  const vitality = (fullness + energy + hydration) / 30; // 0–1

  return (
    <div
      data-testid="reflection-card"
      style={{
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(160deg, rgba(255,255,255,0.96), rgba(251,247,242,0.92))",
        border: `1.5px solid rgba(58,143,136,${(0.22 + vitality * 0.3).toFixed(2)})`,
        borderRadius: "1rem",
        padding: "20px 22px 16px",
        backdropFilter: "blur(6px)",
        boxShadow: [
          `0 4px 24px rgba(31,78,73,${(0.1 + vitality * 0.08).toFixed(2)})`,
          `0 0 ${Math.round(12 + vitality * 26)}px rgba(240,165,118,${(vitality * 0.35).toFixed(2)})`,
        ].join(", "),
        transition: "border-color 500ms ease, box-shadow 500ms ease",
        width: "100%",
      }}
    >
      {/* Sheen sweep */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%)",
          transform: sheen ? "translateX(100%)" : "translateX(-120%)",
          transition: sheen ? "transform 0.35s ease-out" : "none",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <span style={{ color: TEAL, fontSize: 8 }}>●</span>
        <span
          className="font-sans"
          style={{
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: DEEP_TEAL,
            opacity: 0.7,
            fontVariant: "small-caps",
            fontWeight: 600,
          }}
        >
          FeelFed noticed
        </span>
      </div>

      {/* Title — typewriter */}
      <p
        className="font-serif"
        style={{
          fontStyle: "italic",
          fontSize: 21,
          lineHeight: 1.3,
          color: DEEP_TEAL,
          minHeight: "1.8rem",
          margin: 0,
        }}
      >
        {displayedTitle}
        <span
          style={{
            display: "inline-block",
            width: 1.5,
            height: "1em",
            marginLeft: 2,
            verticalAlign: "text-bottom",
            background: TEAL,
            animation: "feelfed-caret 0.9s step-end infinite",
          }}
        />
      </p>

      {/* Body + next step */}
      <div
        style={{
          opacity: bodyVisible ? 1 : 0,
          transform: bodyVisible ? "translateY(0)" : "translateY(6px)",
          transition: "opacity 0.55s ease, transform 0.55s ease",
        }}
      >
        <p
          className="font-mono"
          style={{
            fontSize: 13.5,
            lineHeight: 1.6,
            color: DEEP_TEAL,
            opacity: 0.85,
            margin: "8px 0 0",
          }}
        >
          {reflection.body}
        </p>
        <p
          className="font-mono"
          style={{
            fontStyle: "italic",
            fontSize: 12.5,
            lineHeight: 1.55,
            color: TEAL,
            margin: "10px 0 0",
          }}
        >
          {reflection.next}
        </p>
      </div>

      {/* Footer row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 12,
          marginTop: 14,
          opacity: bodyVisible ? 1 : 0,
          transition: "opacity 0.6s ease 150ms",
        }}
      >
        <p
          className="font-mono"
          style={{
            fontStyle: "italic",
            fontSize: 11,
            color: DEEP_TEAL,
            opacity: 0.45,
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          Recorded as you reported it. FeelFed never guesses why.
        </p>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isPending || saved}
          style={{ flexShrink: 0, fontSize: 11 }}
        >
          {saved ? "Saved ✓" : isPending ? "Saving…" : "Save moment"}
        </Button>
      </div>

      <style>{`
        @keyframes feelfed-caret {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
