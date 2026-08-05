import { useState, useEffect, useCallback, useRef } from "react";
import DraggableRings, { mixColors } from "@/components/DraggableRings";
import type { RingId } from "@/components/DraggableRings";
import MoteCanvas from "@/components/MoteCanvas";
import AmbientLayer from "@/components/AmbientLayer";
import ReflectionCard from "@/components/ReflectionCard";
import StatusChips from "@/components/StatusChips";
import MomentHistory from "@/components/MomentHistory";
import WaitlistModal from "@/components/WaitlistModal";
import TrustBadges from "@/components/TrustBadges";
import { useGetMoments } from "@workspace/api-client-react";
import { getDeviceId } from "@/lib/deviceId";

const DEEP_TEAL = "#1F4E49";
const TEAL = "#3A8F88";

const RING_COLORS: Record<RingId, [string, string]> = {
  fullness:  ["#BBD8D4", "#26706A"],
  energy:    ["#A3ADAB", "#FF9E52"],
  hydration: ["#C4A483", "#3FA9D4"],
};

export default function Home() {
  const [fullness, setFullness]   = useState(0);
  const [energy, setEnergy]       = useState(0);
  const [hydration, setHydration] = useState(0);
  const [mounted, setMounted]     = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [deviceId]  = useState(() => getDeviceId());
  const [prefilled, setPrefilled] = useState(false);
  const [activeRing, setActiveRing] = useState<RingId | null>(null);
  const sweepDone = useRef(false);

  // Load most recent moment to prefill rings
  const { data: momentsData } = useGetMoments({ deviceId, limit: 1 });

  useEffect(() => {
    if (prefilled) return;
    const latest = momentsData?.moments?.[0];
    if (latest) {
      setFullness(latest.fullness);
      setEnergy(latest.energy);
      setHydration(latest.hydration);
      setPrefilled(true);
      sweepDone.current = true;
    }
  }, [momentsData, prefilled]);

  // Sync CSS custom properties for ambient layer
  useEffect(() => {
    document.documentElement.style.setProperty("--fullness", String(fullness / 10));
    document.documentElement.style.setProperty("--energy",   String(energy   / 10));
    document.documentElement.style.setProperty("--hydration",String(hydration / 10));
  }, [fullness, energy, hydration]);

  // Staggered load sweep (fullness → energy → hydration)
  useEffect(() => {
    const tMount = setTimeout(() => setMounted(true), 60);
    if (sweepDone.current) return () => clearTimeout(tMount);

    sweepDone.current = true;
    const TARGET = 5.5;
    const DURATION = 480;

    function sweepRing(setter: (v: number) => void, delay: number) {
      return setTimeout(() => {
        let t0: number | null = null;
        const tick = (now: number) => {
          if (!t0) t0 = now;
          const p = Math.min(1, (now - t0) / DURATION);
          setter(Math.round((1 - Math.pow(1 - p, 3)) * TARGET * 2) / 2);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, delay);
    }

    const t1 = sweepRing(setFullness, 420);
    const t2 = sweepRing(setEnergy, 700);
    const t3 = sweepRing(setHydration, 980);
    return () => { clearTimeout(tMount); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const handleFullness  = useCallback((v: number) => setFullness(v),  []);
  const handleEnergy    = useCallback((v: number) => setEnergy(v),    []);
  const handleHydration = useCallback((v: number) => setHydration(v), []);
  const handleActiveChange = useCallback((ring: RingId | null) => setActiveRing(ring), []);

  const activeColor: string | null = activeRing
    ? mixColors(
        RING_COLORS[activeRing][0],
        RING_COLORS[activeRing][1],
        (activeRing === "fullness" ? fullness : activeRing === "energy" ? energy : hydration) / 10
      )
    : null;

  const fade = (delay: number): React.CSSProperties => ({
    opacity:   mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(16px)",
    transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
  });

  const interactivePanel = (
    <>
      {/* Ring cluster — the rings carry their own drag cues (glow, pulse, hint) */}
      <div style={{ ...fade(300), width: "100%" }}>
        <DraggableRings
          fullness={fullness}
          energy={energy}
          hydration={hydration}
          onFullnessChange={handleFullness}
          onEnergyChange={handleEnergy}
          onHydrationChange={handleHydration}
          onActiveChange={handleActiveChange}
        />
      </div>

      {/* Status chips */}
      <div style={{ ...fade(380), marginTop: 14, width: "100%" }}>
        <StatusChips
          fullness={fullness}
          energy={energy}
          hydration={hydration}
          activeRing={activeRing}
          activeColor={activeColor}
        />
      </div>

      {/* Reflection card */}
      <div style={{ ...fade(460), marginTop: 14, width: "100%" }}>
        <ReflectionCard fullness={fullness} energy={energy} hydration={hydration} />
      </div>

      {/* Moment history */}
      <div style={{ ...fade(540), marginTop: 22, width: "100%" }}>
        <MomentHistory deviceId={deviceId} />
      </div>
    </>
  );

  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ background: "#FBF7F2" }}
    >
      {/* Fixed ambient layers */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <AmbientLayer energy={energy} hydration={hydration} />
        <MoteCanvas energy={energy} />
      </div>

      {/* ── Page shell ─────────────────────────────────────────────────────── */}
      <div
        className={[
          "relative z-[2] w-full mx-auto",
          /* mobile: single column, tablet: slightly wider, desktop: two-column grid */
          "px-5 sm:px-8 lg:px-12 xl:px-16",
          "pt-10 pb-[calc(2.5rem+env(safe-area-inset-bottom))]",
          "max-w-lg sm:max-w-xl lg:max-w-screen-lg",
          "lg:grid lg:grid-cols-[1fr_minmax(0,480px)] lg:gap-16 xl:gap-24 lg:items-start",
        ].join(" ")}
      >
        {/* ── LEFT / HERO COLUMN ─────────────────────────────────────────── */}
        <div className="lg:sticky lg:top-12 lg:pb-12">
          {/* Logo + wordmark */}
          <div style={{ ...fade(0), display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <img
              src="/logo.png"
              alt="FeelFed"
              style={{ height: 36, width: 36, objectFit: "cover", borderRadius: "50%", flexShrink: 0 }}
            />
            <span className="font-serif"
              style={{ fontSize: 20, fontWeight: 600, color: DEEP_TEAL, letterSpacing: "-0.01em" }}>
              FeelFed
            </span>
            <span className="font-sans"
              style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase",
                color: TEAL, opacity: 0.65, marginLeft: 4, alignSelf: "flex-end", paddingBottom: 3 }}>
              Coming soon to iOS
            </span>
          </div>

          {/* Headline */}
          <div style={fade(80)}>
            <h1
              className="font-serif"
              style={{
                fontSize: "clamp(2.6rem, 8vw, 4.2rem)",
                fontWeight: 500,
                lineHeight: 1.05,
                color: DEEP_TEAL,
                margin: 0,
                marginBottom: 18,
                letterSpacing: "-0.02em",
              }}
            >
              Four bites is{" "}
              <br />
              still{" "}
              <em style={{ fontStyle: "italic", color: "#F0A576" }}>data.</em>
            </h1>
          </div>

          {/* Body copy */}
          <div style={fade(160)}>
            <p className="font-mono"
              style={{ fontSize: "clamp(0.875rem, 2.2vw, 1rem)", lineHeight: 1.65,
                color: DEEP_TEAL, opacity: 0.8, margin: 0, marginBottom: 28 }}>
              Most food apps assume you finish the plate. FeelFed records what
              actually happened: the four bites, the smoothie day, or the day you
              had no appetite at all.{" "}
              <strong style={{ fontWeight: 700 }}>
                Log fullness, energy, and hydration without grades, streaks, or guilt.
              </strong>
            </p>
          </div>

          {/* CTA row */}
          <div style={{ ...fade(220), display: "flex", flexWrap: "wrap", alignItems: "center",
            gap: "16px 20px", marginBottom: 0 }}>
            <button
              onClick={() => setWaitlistOpen(true)}
              className="font-sans inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-7 h-11 text-sm font-semibold tracking-wide transition-all hover:opacity-90 hover:-translate-y-px active:translate-y-0 shrink-0"
              style={{ minHeight: 44, boxShadow: "0 4px 18px hsla(var(--primary) / 0.32)" }}
            >
              Join the waitlist
            </button>
            <a href="#"
              onClick={(e) => e.preventDefault()}
              className="font-mono text-sm underline underline-offset-2 transition-colors hover:opacity-80 cursor-pointer"
              style={{ color: DEEP_TEAL, opacity: 0.5 }}>
              See a sample doctor summary
            </a>
          </div>

          {/* Trust badges */}
          <div style={{ ...fade(260), marginTop: 24 }}>
            <TrustBadges />
          </div>

          {/* On mobile the interactive panel comes here (below CTA) */}
          <div className="lg:hidden mt-8 flex flex-col gap-0">
            {interactivePanel}
          </div>
        </div>

        {/* ── RIGHT / INTERACTIVE COLUMN (desktop only) ──────────────────── */}
        <div className="hidden lg:flex lg:flex-col">
          {interactivePanel}
        </div>
      </div>

      <WaitlistModal open={waitlistOpen} onClose={() => setWaitlistOpen(false)} />
    </div>
  );
}
