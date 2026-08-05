import { useRef, useCallback, useState } from "react";

interface DraggableRingsProps {
  fullness: number;
  energy: number;
  hydration: number;
  onFullnessChange: (v: number) => void;
  onEnergyChange: (v: number) => void;
  onHydrationChange: (v: number) => void;
}

const CX = 160;
const CY = 160;
const OUTER_R = 138;
const MID_R = 103;
const INNER_R = 68;
const STROKE = 15;

// Colors
const TEAL = "#3A8F88";
const PEACH = "#F0A576";
const BLUE = "#5FA8C4";
const CREAM = "#FBF7F2";
const DEEP_TEAL = "#1F4E49";

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number
): string {
  // Convert degrees to radians (0° = 12 o'clock = top)
  const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;
  const start = toRad(startDeg);
  const end = toRad(endDeg);
  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

function fullCircle(cx: number, cy: number, r: number): string {
  return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.001} ${cy - r}`;
}

type RingId = "fullness" | "energy" | "hydration";

export default function DraggableRings({
  fullness,
  energy,
  hydration,
  onFullnessChange,
  onEnergyChange,
  onHydrationChange,
}: DraggableRingsProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const draggingRef = useRef<RingId | null>(null);
  const [pulsingRing, setPulsingRing] = useState<RingId | null>(null);

  const getRingConfig = useCallback(
    (ring: RingId) => {
      switch (ring) {
        case "fullness":
          return { r: OUTER_R, value: fullness, color: TEAL, onChange: onFullnessChange };
        case "energy":
          return { r: MID_R, value: energy, color: PEACH, onChange: onEnergyChange };
        case "hydration":
          return { r: INNER_R, value: hydration, color: BLUE, onChange: onHydrationChange };
      }
    },
    [fullness, energy, hydration, onFullnessChange, onEnergyChange, onHydrationChange]
  );

  const getAngleFromCenter = useCallback(
    (clientX: number, clientY: number): number => {
      const svg = svgRef.current;
      if (!svg) return 0;
      const rect = svg.getBoundingClientRect();
      const scaleX = 320 / rect.width;
      const scaleY = 320 / rect.height;
      const svgX = (clientX - rect.left) * scaleX;
      const svgY = (clientY - rect.top) * scaleY;
      const dx = svgX - CX;
      const dy = svgY - CY;
      // atan2 from 12 o'clock, clockwise
      let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
      if (angle < 0) angle += 360;
      return angle;
    },
    []
  );

  const getNearestRing = useCallback(
    (clientX: number, clientY: number): RingId | null => {
      const svg = svgRef.current;
      if (!svg) return null;
      const rect = svg.getBoundingClientRect();
      const scaleX = 320 / rect.width;
      const scaleY = 320 / rect.height;
      const svgX = (clientX - rect.left) * scaleX;
      const svgY = (clientY - rect.top) * scaleY;
      const dist = Math.sqrt((svgX - CX) ** 2 + (svgY - CY) ** 2);

      const rings: { id: RingId; r: number }[] = [
        { id: "fullness", r: OUTER_R },
        { id: "energy", r: MID_R },
        { id: "hydration", r: INNER_R },
      ];

      let nearest: RingId | null = null;
      let minDiff = Infinity;
      for (const { id, r } of rings) {
        const diff = Math.abs(dist - r);
        if (diff < 20 && diff < minDiff) {
          minDiff = diff;
          nearest = id;
        }
      }
      return nearest;
    },
    []
  );

  const updateValueFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const ring = draggingRef.current;
      if (!ring) return;
      const config = getRingConfig(ring);
      const angle = getAngleFromCenter(clientX, clientY);
      const rawValue = (angle / 360) * 10;
      const clamped = Math.min(10, Math.max(0, rawValue));
      const snapped = Math.round(clamped * 2) / 2; // 0.5 increments
      config.onChange(snapped);
    },
    [getRingConfig, getAngleFromCenter]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      const ring = getNearestRing(e.clientX, e.clientY);
      if (!ring) return;
      draggingRef.current = ring;
      (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
      updateValueFromPointer(e.clientX, e.clientY);
    },
    [getNearestRing, updateValueFromPointer]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!draggingRef.current) return;
      updateValueFromPointer(e.clientX, e.clientY);
    },
    [updateValueFromPointer]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      const ring = draggingRef.current;
      if (ring) {
        setPulsingRing(ring);
        setTimeout(() => setPulsingRing(null), 500);
      }
      draggingRef.current = null;
      (e.currentTarget as SVGSVGElement).releasePointerCapture(e.pointerId);
    },
    []
  );

  const renderRing = (
    id: RingId,
    r: number,
    value: number,
    color: string,
    label: string
  ) => {
    const pct = value / 10;
    const endAngle = pct * 360;
    const isPulsing = pulsingRing === id;
    const arcPath = pct >= 0.999 ? fullCircle(CX, CY, r) : describeArc(CX, CY, r, 0, endAngle);

    return (
      <g key={id} data-ring={id}>
        {/* Track */}
        <circle
          cx={CX}
          cy={CY}
          r={r}
          fill="none"
          stroke={CREAM}
          strokeWidth={STROKE}
          opacity={0.35}
        />
        {/* Subtle track tint */}
        <circle
          cx={CX}
          cy={CY}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          opacity={0.12}
        />

        {/* Fill arc */}
        {pct > 0.001 && (
          <path
            data-testid={`ring-arc-${id}`}
            d={arcPath}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            style={{
              transformOrigin: `${CX}px ${CY}px`,
              transform: isPulsing ? "scale(1.04)" : "scale(1)",
              transition: isPulsing
                ? "transform 0.15s cubic-bezier(0.34,1.56,0.64,1)"
                : "transform 0.3s ease",
              filter: `drop-shadow(0 0 6px ${color}88)`,
            }}
          />
        )}

        {/* Hit area ring (invisible, wide) */}
        <circle
          cx={CX}
          cy={CY}
          r={r}
          fill="none"
          stroke="transparent"
          strokeWidth={36}
          style={{ cursor: "pointer" }}
        />
      </g>
    );
  };

  // Label positions: top-right quadrant of each ring
  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="relative w-full max-w-xs mx-auto">
        <svg
          ref={svgRef}
          viewBox="0 0 320 320"
          width="100%"
          style={{ cursor: "crosshair", touchAction: "none", display: "block" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Outer ring: Fullness */}
          {renderRing("fullness", OUTER_R, fullness, TEAL, "Fullness")}
          {/* Middle ring: Energy */}
          {renderRing("energy", MID_R, energy, PEACH, "Energy")}
          {/* Inner ring: Hydration */}
          {renderRing("hydration", INNER_R, hydration, BLUE, "Hydration")}

          {/* Logo center: teal fill rising behind logo */}
          <foreignObject x={CX - 40} y={CY - 40} width={80} height={80}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                overflow: "hidden",
                position: "relative",
                background: CREAM,
              }}
            >
              {/* Logo underneath */}
              <img
                src="/logo.png"
                alt="FeelFed"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              {/* Rising teal fill on top — multiply blend makes it visible through the opaque PNG */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: TEAL,
                  height: `${(fullness / 10) * 100}%`,
                  transition: "height 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                  mixBlendMode: "multiply",
                  opacity: 0.72,
                }}
              />
            </div>
          </foreignObject>
        </svg>

        {/* HTML ring labels positioned absolutely around the SVG */}
        {/* Fullness: outer ring - left */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "50%",
            left: "2%",
            transform: "translateY(-50%)",
            textAlign: "left",
          }}
        >
          <div className="font-sans text-xs uppercase tracking-wider" style={{ color: DEEP_TEAL, opacity: 0.7 }}>
            Fullness
          </div>
          <div className="font-serif text-lg font-semibold" style={{ color: TEAL, lineHeight: 1 }}>
            {fullness}
          </div>
        </div>

        {/* Energy: middle ring - right */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "32%",
            right: "2%",
            textAlign: "right",
          }}
        >
          <div className="font-sans text-xs uppercase tracking-wider" style={{ color: DEEP_TEAL, opacity: 0.7 }}>
            Energy
          </div>
          <div className="font-serif text-lg font-semibold" style={{ color: PEACH, lineHeight: 1 }}>
            {energy}
          </div>
        </div>

        {/* Hydration: inner ring - right bottom */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "62%",
            right: "2%",
            textAlign: "right",
          }}
        >
          <div className="font-sans text-xs uppercase tracking-wider" style={{ color: DEEP_TEAL, opacity: 0.7 }}>
            Hydration
          </div>
          <div className="font-serif text-lg font-semibold" style={{ color: BLUE, lineHeight: 1 }}>
            {hydration}
          </div>
        </div>
      </div>
    </div>
  );
}
