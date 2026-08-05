import { useEffect, useRef, useState, useMemo } from "react";
import { Card, CardContent } from "@workspace/feelfed-ds/components/ui/card";

interface ReflectionCardProps {
  fullness: number;
  energy: number;
  hydration: number;
}

type Band = "L" | "M" | "H";

const band = (v: number): Band => (v <= 3 ? "L" : v <= 6 ? "M" : "H");

type LookupKey = `${Band},${Band},${Band}`;

const LOOKUP: Partial<Record<LookupKey, string>> = {
  "H,H,H": "Running full and bright today — your body's keeping score.",
  "H,H,L": "Nourished but thirsty — one glass can shift everything.",
  "H,L,H": "Full tank, slow engine — digestion is doing its work.",
  "H,L,L": "Heavy and dry — your body is asking for gentleness right now.",
  "H,M,M": "Steady and full — a solid baseline to build the rest of the day on.",
  "M,H,H": "Running well on not much — efficiency is its own kind of nourishment.",
  "M,H,L": "Energized but running dry — brilliant often comes before thirsty.",
  "M,M,H": "Balanced and hydrated — the quietest kind of good.",
  "M,M,M": "Four bites is still data. You showed up.",
  "M,M,L": "Middle of the road — a glass of water would tip this toward good.",
  "M,L,H": "Low energy after drinking well — your body's redistributing.",
  "M,L,L": "Running on low across the board. That's information, not failure.",
  "L,H,H": "Light and clear — sometimes this is exactly right.",
  "L,H,L": "Empty and buzzing — the kind of energy that burns fast.",
  "L,L,L": "Everything at zero. This is where the journal starts, not ends.",
  "L,M,M": "A little of everything — this is where gentle eating begins.",
  "L,M,H": "Hydrated and waiting — your body knows what comes next.",
  "L,L,H": "Quiet and watered. Rest is data too.",
};

const FALLBACK = "Four bites is still data. You showed up.";

export default function ReflectionCard({
  fullness,
  energy,
  hydration,
}: ReflectionCardProps) {
  const [displayedText, setDisplayedText] = useState("");
  const typewriterRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const charIndexRef = useRef(0);

  const targetText = useMemo(() => {
    const f = band(fullness);
    const e = band(energy);
    const h = band(hydration);
    const key: LookupKey = `${f},${e},${h}`;
    return LOOKUP[key] ?? FALLBACK;
  }, [fullness, energy, hydration]);

  const targetTextRef = useRef(targetText);
  targetTextRef.current = targetText;

  const startTypewriter = (text: string) => {
    if (typewriterRef.current) clearTimeout(typewriterRef.current);
    charIndexRef.current = 0;
    setDisplayedText("");

    const type = () => {
      charIndexRef.current += 1;
      setDisplayedText(text.slice(0, charIndexRef.current));
      if (charIndexRef.current < text.length) {
        typewriterRef.current = setTimeout(type, 40);
      }
    };
    typewriterRef.current = setTimeout(type, 40);
  };

  // Debounce ring changes by 600ms before starting typewriter
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      startTypewriter(targetTextRef.current);
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [targetText]);

  // Start on mount
  useEffect(() => {
    startTypewriter(targetText);
    return () => {
      if (typewriterRef.current) clearTimeout(typewriterRef.current);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card
      data-testid="reflection-card"
      className="w-full max-w-sm mx-auto border shadow-sm"
      style={{
        background: "hsl(var(--background))",
        borderColor: "hsl(var(--border))",
      }}
    >
      <CardContent className="pt-5 pb-4 px-6">
        <p
          className="font-mono text-base leading-relaxed min-h-[3rem]"
          style={{ color: "hsl(var(--foreground))" }}
        >
          {displayedText}
          <span
            className="inline-block w-0.5 h-4 ml-0.5 align-middle animate-pulse"
            style={{ background: "hsl(var(--primary))" }}
          />
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
          <span
            data-testid="pill-fullness"
            className="font-sans text-xs px-2 py-0.5 rounded-full"
            style={{
              background: "hsl(var(--muted))",
              color: "hsl(var(--muted-foreground))",
            }}
          >
            Fullness · {fullness}
          </span>
          <span
            data-testid="pill-energy"
            className="font-sans text-xs px-2 py-0.5 rounded-full"
            style={{
              background: "hsl(var(--muted))",
              color: "hsl(var(--muted-foreground))",
            }}
          >
            Energy · {energy}
          </span>
          <span
            data-testid="pill-hydration"
            className="font-sans text-xs px-2 py-0.5 rounded-full"
            style={{
              background: "hsl(var(--muted))",
              color: "hsl(var(--muted-foreground))",
            }}
          >
            Hydration · {hydration}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
