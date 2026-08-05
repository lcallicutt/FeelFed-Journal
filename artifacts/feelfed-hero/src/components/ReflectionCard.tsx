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

const LOOKUP: Partial<Record<LookupKey, string>> = {
  "H,H,H": "Nourished and charged. Comfortable fullness, strong hydration, energy on the rise. This is the shape of a good day, and now it has a record.",
  "H,H,L": "Your body is asking for gentleness. Fullness is high while hydration sits low. One thing at a time — that's still a record worth keeping.",
  "H,L,H": "Your body is asking for gentleness. Fullness is high while energy sits low. That is a real combination, and it is written down now. Nothing here needs fixing today.",
  "H,L,L": "Quite full, quite depleted. Your body stored something today even if it didn't feel like enough. That counts.",
  "H,M,M": "Full and steady — a real baseline. The middle ground is underrated. This entry says you showed up somewhere solid.",
  "M,H,H": "Running well on not much. Energy and hydration holding up. Some days efficiency is its own kind of nourishment.",
  "M,H,L": "Energised but running dry. Brilliant often comes before thirsty. A glass of water now would complete this picture.",
  "M,M,H": "Balanced and hydrated — the quietest kind of good. Nothing dramatic in any direction. Ordinary days are the ones that make a pattern readable.",
  "M,M,M": "Four bites is still data. You showed up. Mid across the board means you're in the range where the body is just getting by — and that is enough to record.",
  "M,M,L": "Middle of the road in most things, a little dry. The entry is here either way. That is what the journal is for.",
  "M,L,H": "Low battery, still showing up. Not much in, not much left over. Opening this on a day like today counts as the entry.",
  "M,L,L": "Running on low across the board. That's information, not failure. Some days the log is just a witness.",
  "L,H,H": "Light and clear — sometimes this is exactly right. High energy on a light stomach can feel like the right kind of empty.",
  "L,H,L": "Empty and buzzing. The kind of energy that burns fast. Your body is spending reserves it will want back later.",
  "L,L,L": "Everything at zero. This is where the journal starts, not ends. You opened it. That is the whole entry.",
  "L,M,M": "A little of everything — this is where gentle eating begins. No pressure, no grade. Just a starting point written down.",
  "L,M,H": "Hydrated and waiting. Your body knows what comes next. Sometimes the drink comes before the food, and that is still a record.",
  "L,L,H": "Quiet and watered. Rest is data too.",
};

const FALLBACK = "Four bites is still data. You showed up.";

export default function ReflectionCard({ fullness, energy, hydration }: ReflectionCardProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [bodyVisible, setBodyVisible] = useState(false);
  const [sheen, setSheen] = useState(false);
  const [saved, setSaved] = useState(false);

  const typewriterRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const charIndexRef = useRef(0);
  const isFirstMount = useRef(true);

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

  const targetText = useMemo(() => {
    const f = band(fullness);
    const e = band(energy);
    const h = band(hydration);
    const key: LookupKey = `${f},${e},${h}`;
    return LOOKUP[key] ?? FALLBACK;
  }, [fullness, energy, hydration]);

  const targetTextRef = useRef(targetText);
  targetTextRef.current = targetText;

  const startSequence = (text: string) => {
    if (typewriterRef.current) clearTimeout(typewriterRef.current);
    charIndexRef.current = 0;
    setDisplayedText("");
    setBodyVisible(false);

    // 1. Sheen sweep (350ms)
    setSheen(true);
    const sheenOff = setTimeout(() => setSheen(false), 350);

    // 2. Start typewriter after sheen
    const startType = setTimeout(() => {
      const type = () => {
        charIndexRef.current += 1;
        const partial = text.slice(0, charIndexRef.current);
        setDisplayedText(partial);
        if (charIndexRef.current < text.length) {
          typewriterRef.current = setTimeout(type, 32);
        } else {
          // 3. Footer fades in after typing completes
          setTimeout(() => setBodyVisible(true), 80);
        }
      };
      type();
    }, 200);

    return () => {
      clearTimeout(sheenOff);
      clearTimeout(startType);
    };
  };

  // Debounce ring changes
  useEffect(() => {
    if (isFirstMount.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      startSequence(targetTextRef.current);
    }, 600);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetText]);

  // Start on mount
  useEffect(() => {
    isFirstMount.current = false;
    const cleanup = startSequence(targetText);
    return () => {
      cleanup?.();
      if (typewriterRef.current) clearTimeout(typewriterRef.current);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = useCallback(() => {
    saveMoment({
      data: {
        deviceId: getDeviceId(),
        fullness,
        energy,
        hydration,
        reflection: targetText,
      },
    });
  }, [saveMoment, fullness, energy, hydration, targetText]);

  return (
    <div
      data-testid="reflection-card"
      style={{
        position: "relative",
        overflow: "hidden",
        background: "rgba(251,247,242,0.9)",
        border: "1px solid rgba(58,143,136,0.15)",
        borderRadius: "0.75rem",
        padding: "18px 20px 14px",
        backdropFilter: "blur(6px)",
        boxShadow: "0 2px 16px rgba(31,78,73,0.07)",
        width: "100%",
      }}
    >
      {/* Sheen sweep overlay */}
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
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
        <span style={{ color: TEAL, fontSize: 8 }}>●</span>
        <span
          className="font-sans"
          style={{
            fontSize: 9,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: DEEP_TEAL,
            opacity: 0.6,
            fontVariant: "small-caps",
          }}
        >
          FeelFed Noticing
        </span>
      </div>

      {/* Typewriter text — italic serif */}
      <p
        className="font-serif"
        style={{
          fontStyle: "italic",
          fontSize: 16,
          lineHeight: 1.55,
          color: DEEP_TEAL,
          minHeight: "3.5rem",
          margin: 0,
        }}
      >
        {displayedText}
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

      {/* Footer row — disclaimer + save button */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 12,
          marginTop: 14,
          opacity: bodyVisible ? 1 : 0,
          transition: "opacity 0.6s ease",
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

      {/* Caret blink keyframe */}
      <style>{`
        @keyframes feelfed-caret {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
