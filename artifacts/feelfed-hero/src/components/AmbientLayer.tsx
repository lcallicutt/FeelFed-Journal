import { useEffect, useRef } from "react";

interface AmbientLayerProps {
  energy: number;    // 0-10
  hydration: number; // 0-10
}

export default function AmbientLayer({ energy, hydration }: AmbientLayerProps) {
  const energyOpacity = (energy / 10) * 0.18;
  const hydNorm = hydration / 10;

  // Prismatic caustics: kicks in above 0.5 hydration
  const causticOpacity = Math.max(0, hydNorm * 2 - 1) * 0.08;

  // Dry grain: kicks in below 0.5 hydration
  const grainOpacity = Math.max(0, (0.5 - hydNorm) * 0.3);

  const causticRef = useRef<HTMLDivElement>(null);
  const grainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Update CSS vars for animated caustic gradient rotation
    document.documentElement.style.setProperty(
      "--caustic-opacity",
      String(causticOpacity)
    );
    document.documentElement.style.setProperty(
      "--grain-opacity",
      String(grainOpacity)
    );
  }, [causticOpacity, grainOpacity]);

  return (
    <>
      {/* Energy warm overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          background: "radial-gradient(ellipse at 50% 80%, #F0A576 0%, transparent 70%)",
          opacity: energyOpacity,
          transition: "opacity 0.6s ease",
          pointerEvents: "none",
        }}
      />

      {/* Hydration caustic prismatic shimmer */}
      <div
        ref={causticRef}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          background: "conic-gradient(from 0deg at 40% 30%, #5FA8C4 0%, #3A8F88 30%, transparent 50%, #5FA8C4 70%, transparent 100%)",
          opacity: causticOpacity,
          transition: "opacity 0.8s ease",
          animation: "causticRotate 12s linear infinite",
          pointerEvents: "none",
          mixBlendMode: "screen",
        }}
      />

      {/* Dry grain svg filter overlay */}
      <div
        ref={grainRef}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          opacity: grainOpacity,
          transition: "opacity 0.8s ease",
          pointerEvents: "none",
          filter: "url(#grain-filter)",
          background: "rgba(200, 160, 100, 0.25)",
        }}
      />

      {/* Hidden SVG filter definition */}
      <svg
        style={{ position: "fixed", width: 0, height: 0, overflow: "hidden" }}
        aria-hidden="true"
      >
        <defs>
          <filter id="grain-filter" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix
              type="saturate"
              values="0"
              in="noise"
              result="graynoise"
            />
            <feBlend in="SourceGraphic" in2="graynoise" mode="multiply" />
          </filter>
        </defs>
      </svg>
    </>
  );
}
