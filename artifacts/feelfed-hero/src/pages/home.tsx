import { useState, useEffect, useCallback } from "react";
import DraggableRings from "@/components/DraggableRings";
import MoteCanvas from "@/components/MoteCanvas";
import AmbientLayer from "@/components/AmbientLayer";
import ReflectionCard from "@/components/ReflectionCard";

const DEEP_TEAL = "#1F4E49";
const TEAL = "#3A8F88";

export default function Home() {
  const [fullness, setFullness] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [hydration, setHydration] = useState(5);
  const [mounted, setMounted] = useState(false);

  // Sync CSS custom properties
  useEffect(() => {
    document.documentElement.style.setProperty("--fullness", String(fullness / 10));
    document.documentElement.style.setProperty("--energy", String(energy / 10));
    document.documentElement.style.setProperty("--hydration", String(hydration / 10));
  }, [fullness, energy, hydration]);

  // Entrance animation
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleFullness = useCallback((v: number) => setFullness(v), []);
  const handleEnergy = useCallback((v: number) => setEnergy(v), []);
  const handleHydration = useCallback((v: number) => setHydration(v), []);

  const layerStyle = (delay: number) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(20px)",
    transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
  });

  return (
    <div
      className="relative min-h-screen w-full flex flex-col items-center justify-between overflow-hidden"
      style={{ background: "#FBF7F2" }}
    >
      {/* Ambient background layers (behind content) */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <AmbientLayer energy={energy} hydration={hydration} />
        <MoteCanvas energy={energy} />
      </div>

      {/* Page content above ambient layers */}
      <div
        className="relative flex flex-col items-center w-full max-w-lg mx-auto px-4 pt-10 pb-8 gap-6"
        style={{ zIndex: 2 }}
      >
        {/* Wordmark */}
        <div style={layerStyle(0)}>
          <span
            className="font-sans text-xs tracking-widest uppercase"
            style={{ color: TEAL, letterSpacing: "0.3em" }}
          >
            FeelFed
          </span>
        </div>

        {/* Headline */}
        <div style={layerStyle(120)} className="text-center">
          <h1
            className="font-serif text-4xl md:text-5xl font-medium leading-tight"
            style={{ color: DEEP_TEAL }}
          >
            Four bites is still data.
          </h1>
        </div>

        {/* Ring cluster */}
        <div
          style={{ ...layerStyle(240), width: "100%" }}
          className="flex items-center justify-center"
        >
          <DraggableRings
            fullness={fullness}
            energy={energy}
            hydration={hydration}
            onFullnessChange={handleFullness}
            onEnergyChange={handleEnergy}
            onHydrationChange={handleHydration}
          />
        </div>

        {/* Reflection card */}
        <div style={{ ...layerStyle(360), width: "100%" }}>
          <ReflectionCard
            fullness={fullness}
            energy={energy}
            hydration={hydration}
          />
        </div>

        {/* Instruction hint */}
        <div style={layerStyle(480)}>
          <p
            className="font-sans text-xs text-center"
            style={{ color: TEAL, opacity: 0.55 }}
          >
            Drag the rings to set your levels
          </p>
        </div>
      </div>
    </div>
  );
}
