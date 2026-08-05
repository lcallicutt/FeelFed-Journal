interface AmbientLayerProps {
  energy: number;    // 0-10
  hydration: number; // 0-10
}

// Five water-drop blobs at varied screen positions
// Each has a fixed position (% of screen) and a size range
const WATER_DROPS = [
  { top: "8%",  left: "15%", baseSize: 220, blur: 70, color: "#5FA8C4" },
  { top: "30%", left: "72%", baseSize: 180, blur: 55, color: "#3A8F88" },
  { top: "58%", left: "8%",  baseSize: 260, blur: 80, color: "#5FA8C4" },
  { top: "72%", left: "65%", baseSize: 160, blur: 50, color: "#7EC8D8" },
  { top: "18%", left: "50%", baseSize: 200, blur: 65, color: "#3A8F88" },
];

export default function AmbientLayer({ energy, hydration }: AmbientLayerProps) {
  const energyOpacity = (energy / 10) * 0.18;
  const hydNorm = hydration / 10;

  // Dry grain: kicks in below 0.5 hydration
  const grainOpacity = Math.max(0, (0.5 - hydNorm) * 0.28);

  // Water drops: fade in above hydration 3 (0.3), grow with hydration
  // At hydration 3 → 0 opacity, hydration 10 → full opacity
  const dropProgress = Math.max(0, (hydNorm - 0.3) / 0.7); // 0→1 from hyd 3 to 10

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

      {/* Hydration: large blurred water-drop blobs */}
      {WATER_DROPS.map((drop, i) => {
        // Each drop grows in size and opacity with hydration
        const size = drop.baseSize * (0.5 + 0.5 * dropProgress);
        const opacity = dropProgress * 0.14 * (i % 2 === 0 ? 1 : 0.75);
        return (
          <div
            key={i}
            style={{
              position: "fixed",
              top: drop.top,
              left: drop.left,
              width: size,
              height: size,
              borderRadius: "50%",
              background: drop.color,
              filter: `blur(${drop.blur}px)`,
              opacity,
              transition: "opacity 0.9s ease, width 0.9s ease, height 0.9s ease",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
              zIndex: 0,
              mixBlendMode: "screen",
            }}
          />
        );
      })}

      {/* Prismatic caustic shimmer — kept as subtle overlay at very high hydration */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          background:
            "conic-gradient(from 0deg at 40% 30%, #5FA8C4 0%, #3A8F88 30%, transparent 50%, #5FA8C4 70%, transparent 100%)",
          opacity: Math.max(0, hydNorm * 2 - 1.4) * 0.06,
          transition: "opacity 0.8s ease",
          animation: "causticRotate 12s linear infinite",
          pointerEvents: "none",
          mixBlendMode: "screen",
        }}
      />

      {/* Dry grain svg filter overlay */}
      <div
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
