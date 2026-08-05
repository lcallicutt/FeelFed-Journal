import { useState, useEffect, useCallback, useRef } from "react";
import DraggableRings from "@/components/DraggableRings";
import MoteCanvas from "@/components/MoteCanvas";
import AmbientLayer from "@/components/AmbientLayer";
import ReflectionCard from "@/components/ReflectionCard";
import StatusChips from "@/components/StatusChips";
import MomentHistory from "@/components/MomentHistory";
import { useGetMoments } from "@workspace/api-client-react";
import { getDeviceId } from "@/lib/deviceId";

const DEEP_TEAL = "#1F4E49";
const TEAL = "#3A8F88";

export default function Home() {
  const [fullness, setFullness] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [hydration, setHydration] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [arrowBounce, setArrowBounce] = useState(false);
  const [deviceId] = useState(() => getDeviceId());
  const [prefilled, setPrefilled] = useState(false);
  const sweepDone = useRef(false);

  // Load most recent moment to prefill rings on first load
  const { data: momentsData } = useGetMoments({ deviceId, limit: 1 });

  // Pre-fill rings from most recent saved moment (once, on first load)
  // If we prefill, skip the sweep animation
  useEffect(() => {
    if (prefilled) return;
    const latest = momentsData?.moments?.[0];
    if (latest) {
      setFullness(latest.fullness);
      setEnergy(latest.energy);
      setHydration(latest.hydration);
      setPrefilled(true);
      sweepDone.current = true; // prevent sweep from running
    }
  }, [momentsData, prefilled]);

  // Sync CSS custom properties
  useEffect(() => {
    document.documentElement.style.setProperty("--fullness", String(fullness / 10));
    document.documentElement.style.setProperty("--energy", String(energy / 10));
    document.documentElement.style.setProperty("--hydration", String(hydration / 10));
  }, [fullness, energy, hydration]);

  // Entrance animation + load sweep (rings 0 → 5, staggered)
  useEffect(() => {
    const tMount = setTimeout(() => setMounted(true), 60);

    if (!sweepDone.current) {
      sweepDone.current = true;

      const DURATION = 700;
      const STAGGER = 80;
      const start = performance.now();

      const animate = (now: number) => {
        const elapsed = now - start;
        const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

        const fProgress = Math.min(1, elapsed / DURATION);
        const eProgress = Math.min(1, Math.max(0, (elapsed - STAGGER) / DURATION));
        const hProgress = Math.min(1, Math.max(0, (elapsed - STAGGER * 2) / DURATION));

        setFullness(Math.round(easeOut(fProgress) * 5 * 2) / 2);
        setEnergy(Math.round(easeOut(eProgress) * 5 * 2) / 2);
        setHydration(Math.round(easeOut(hProgress) * 5 * 2) / 2);

        if (hProgress < 1) {
          requestAnimationFrame(animate);
        }
      };

      const tSweep = setTimeout(() => requestAnimationFrame(animate), 300);
      return () => {
        clearTimeout(tMount);
        clearTimeout(tSweep);
      };
    }

    return () => clearTimeout(tMount);
  }, []);

  // Arrow bounce loop
  useEffect(() => {
    const id = setInterval(() => {
      setArrowBounce(true);
      setTimeout(() => setArrowBounce(false), 600);
    }, 2400);
    return () => clearInterval(id);
  }, []);

  const handleFullness = useCallback((v: number) => setFullness(v), []);
  const handleEnergy = useCallback((v: number) => setEnergy(v), []);
  const handleHydration = useCallback((v: number) => setHydration(v), []);

  const layerStyle = (delay: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(18px)",
    transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
  });

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{ background: "#FBF7F2" }}
    >
      {/* Ambient background layers */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <AmbientLayer energy={energy} hydration={hydration} />
        <MoteCanvas energy={energy} />
      </div>

      {/* Page content */}
      <div
        className="relative w-full max-w-lg mx-auto px-6 pt-10 pb-12 flex flex-col gap-0"
        style={{ zIndex: 2 }}
      >
        {/* Logo + wordmark */}
        <div style={{ ...layerStyle(0), display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <img
            src="/logo.png"
            alt="FeelFed"
            style={{ height: 36, width: 36, objectFit: "cover", borderRadius: "50%" }}
          />
          <span
            className="font-serif"
            style={{ fontSize: 20, fontWeight: 600, color: DEEP_TEAL, letterSpacing: "-0.01em" }}
          >
            FeelFed
          </span>
          <span
            className="font-sans"
            style={{
              fontSize: 9,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: TEAL,
              opacity: 0.65,
              marginLeft: 4,
              alignSelf: "flex-end",
              paddingBottom: 3,
            }}
          >
            Coming soon to iOS
          </span>
        </div>

        {/* Display headline */}
        <div style={layerStyle(80)}>
          <h1
            className="font-serif"
            style={{
              fontSize: "clamp(2.6rem, 8vw, 3.6rem)",
              fontWeight: 500,
              lineHeight: 1.08,
              color: DEEP_TEAL,
              margin: 0,
              marginBottom: 20,
            }}
          >
            Four bites is{" "}
            <br />
            still{" "}
            <em style={{ fontStyle: "italic", color: "#F0A576" }}>data.</em>
          </h1>
        </div>

        {/* Body copy */}
        <div style={layerStyle(160)}>
          <p
            className="font-mono"
            style={{
              fontSize: 15,
              lineHeight: 1.65,
              color: DEEP_TEAL,
              opacity: 0.8,
              margin: 0,
              marginBottom: 32,
              maxWidth: 440,
            }}
          >
            Most food apps assume you finish the plate. FeelFed is for the days
            you get full in three bites, the days a smoothie is the win, the days
            there's no appetite at all.{" "}
            <strong style={{ fontWeight: 700 }}>
              Log what actually happened. Nothing gets graded.
            </strong>
          </p>
        </div>

        {/* DRAG A RING prompt */}
        <div style={{ ...layerStyle(240), marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              className="font-sans"
              style={{
                fontSize: 10,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: DEEP_TEAL,
                opacity: 0.5,
                fontVariant: "small-caps",
              }}
            >
              Drag a ring
            </span>
            <span
              style={{
                color: DEEP_TEAL,
                opacity: 0.5,
                fontSize: 13,
                display: "inline-block",
                transform: arrowBounce ? "translateY(3px)" : "translateY(0)",
                transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
              }}
            >
              ↓
            </span>
          </div>
        </div>

        {/* Ring cluster */}
        <div style={{ ...layerStyle(320), width: "100%" }}>
          <DraggableRings
            fullness={fullness}
            energy={energy}
            hydration={hydration}
            onFullnessChange={handleFullness}
            onEnergyChange={handleEnergy}
            onHydrationChange={handleHydration}
          />
        </div>

        {/* Status chips */}
        <div style={{ ...layerStyle(400), marginTop: 16, width: "100%" }}>
          <StatusChips fullness={fullness} energy={energy} hydration={hydration} />
        </div>

        {/* Reflection card */}
        <div style={{ ...layerStyle(480), marginTop: 16, width: "100%" }}>
          <ReflectionCard fullness={fullness} energy={energy} hydration={hydration} />
        </div>

        {/* Moment history */}
        <div style={{ ...layerStyle(560), marginTop: 24, width: "100%" }}>
          <MomentHistory deviceId={deviceId} />
        </div>
      </div>
    </div>
  );
}
