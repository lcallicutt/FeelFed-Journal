import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Heart } from "lucide-react";
import { Button } from "@workspace/feelfed-ds/components/ui/button";
import { toast } from "@workspace/feelfed-ds/hooks/use-toast";
import { cn } from "@workspace/feelfed-ds/lib/utils";
import DraggableRings, { ringColor } from "@/components/draggable-rings";
import {
  fullnessPhrase,
  energyPhrase,
  hydrationPhrase,
  getReflection,
  type RingId,
} from "@/lib/reflections";
import { store, nextId } from "@/lib/store";

/**
 * Today's hero: the website's draggable rings adapted for the app. Dragging sets
 * fullness / energy / hydration (0-10); the reflection updates live; "Save
 * moment" records a `moment` entry into the in-memory store (shows in Today's
 * moments + History).
 */
export function FullnessRingHero() {
  const [fullness, setFullness] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [hydration, setHydration] = useState(5);
  const [activeRing, setActiveRing] = useState<RingId | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (savedTimer.current) clearTimeout(savedTimer.current);
  }, []);

  const reflection = getReflection(fullness, energy, hydration);

  // typewriter for the reflection title, retriggered only when title changes
  const [typed, setTyped] = useState("");
  const [bodyVisible, setBodyVisible] = useState(false);
  const lastTitle = useRef("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (reflection.title === lastTitle.current) return;
    lastTitle.current = reflection.title;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setTyped("");
    setBodyVisible(false);
    const start = setTimeout(() => {
      let i = 0;
      const type = () => {
        i++;
        setTyped(reflection.title.slice(0, i));
        if (i < reflection.title.length) {
          timers.current.push(setTimeout(type, 32));
        } else {
          timers.current.push(setTimeout(() => setBodyVisible(true), 120));
        }
      };
      type();
    }, 120);
    timers.current.push(start);
  }, [reflection.title]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const handleSave = useCallback(() => {
    store.addEntry({
      id: nextId(),
      kind: "moment",
      at: new Date().toISOString(),
      fullness,
      energy,
      hydration,
      reflection: `${reflection.title} ${reflection.body}`,
    });
    setJustSaved(true);
    toast({ title: "Moment saved", description: "It's in Today and your History now." });
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setJustSaved(false), 2000);
  }, [fullness, energy, hydration, reflection]);

  const chips: { id: RingId; label: string; phrase: string; value: number }[] = [
    { id: "fullness", label: "Fullness", phrase: fullnessPhrase(fullness), value: fullness },
    { id: "energy", label: "Energy", phrase: energyPhrase(energy), value: energy },
    { id: "hydration", label: "Hydration", phrase: hydrationPhrase(hydration), value: hydration },
  ];

  return (
    <section
      className="rounded-3xl border border-primary/15 bg-gradient-to-b from-secondary/10 to-background px-4 pt-5 pb-4"
      data-testid="section-ring-hero"
      aria-label="How are you right now"
    >
      <div className="text-center mb-1">
        <p className="font-sans text-[0.7rem] uppercase tracking-widest text-primary/70">
          How are you right now
        </p>
      </div>

      <DraggableRings
        fullness={fullness}
        energy={energy}
        hydration={hydration}
        onFullnessChange={setFullness}
        onEnergyChange={setEnergy}
        onHydrationChange={setHydration}
        onActiveChange={setActiveRing}
      />

      {/* Status chips */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        {chips.map((c) => {
          const active = activeRing === c.id;
          return (
            <div
              key={c.id}
              className={cn(
                "rounded-xl border px-2.5 py-2 transition-all",
                active ? "border-primary/40 bg-card -translate-y-0.5" : "border-border bg-secondary/5",
              )}
              data-testid={`chip-${c.id}`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ background: ringColor(c.id, c.value) }}
                />
                <span className="font-sans text-[0.6rem] uppercase tracking-wider text-muted-foreground">
                  {c.label}
                </span>
              </div>
              <p className="font-sans text-xs font-medium text-foreground leading-tight mt-1">
                {c.phrase}
              </p>
            </div>
          );
        })}
      </div>

      {/* Reflection card */}
      <div
        className="relative mt-3 rounded-2xl border border-primary/15 bg-card/80 backdrop-blur px-4 py-3.5"
        data-testid="reflection-card"
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="font-sans text-[0.6rem] uppercase tracking-widest text-secondary/80">
              FeelFed noticed
            </span>
          </div>
          <Heart className="h-3.5 w-3.5 text-accent-foreground/60" />
        </div>

        <p className="font-serif italic text-lg leading-snug text-secondary min-h-[1.6rem]">
          {typed}
          <span className="feelfed-caret" aria-hidden />
        </p>

        <div
          className={cn(
            "transition-all duration-500",
            bodyVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1",
          )}
        >
          <p className="font-mono text-[0.82rem] leading-relaxed text-secondary/85 mt-2">
            {reflection.body}
          </p>
          <p className="font-mono italic text-xs leading-relaxed text-primary mt-2">
            {reflection.next}
          </p>
        </div>

        <div
          className={cn(
            "flex items-end justify-between gap-3 mt-3 transition-opacity duration-500",
            bodyVisible ? "opacity-100" : "opacity-0",
          )}
        >
          <p className="font-mono italic text-[0.65rem] leading-snug text-muted-foreground max-w-[60%]">
            Recorded as you reported it. FeelFed never guesses why.
          </p>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={justSaved}
            className="shrink-0"
            data-testid="button-save-moment"
          >
            {justSaved ? (
              <>
                <Check className="h-4 w-4" /> Moment recorded
              </>
            ) : (
              "Record this moment"
            )}
          </Button>
        </div>
      </div>

      <style>{`
        .feelfed-caret {
          display: inline-block;
          width: 1.5px;
          height: 1em;
          margin-left: 2px;
          vertical-align: text-bottom;
          background: hsl(var(--primary));
          animation: feelfed-caret-blink 0.9s step-end infinite;
        }
        @keyframes feelfed-caret-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .feelfed-caret { animation: none; }
        }
      `}</style>
    </section>
  );
}
