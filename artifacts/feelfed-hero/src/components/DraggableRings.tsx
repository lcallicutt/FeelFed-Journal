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

const TEAL = "#3A8F88";
const PEACH = "#F0A576";
const BLUE = "#5FA8C4";
const CREAM = "#FBF7F2";

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number
): string {
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

/** XY position of the arc endpoint (the knob location) */
function arcEndpoint(r: number, valueDeg: number): { x: number; y: number } {
  const rad = ((valueDeg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
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
        if (diff < 24 && diff < minDiff) {
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
      const snapped = Math.round(clamped * 2) / 2;
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
    color: string
  ) => {
    const pct = value / 10;
    const endAngle = pct * 360;
    const isPulsing = pulsingRing === id;
    const arcPath = pct >= 0.999 ? fullCircle(CX, CY, r) : describeArc(CX, CY, r, 0, endAngle);

    // Knob position: endpoint of the filled arc
    const knob = pct < 0.001
      ? { x: CX, y: CY - r } // at 12 o'clock when empty
      : arcEndpoint(r, endAngle);

    return (
      <g key={id} data-ring={id}>
        {/* Track */}
        <circle cx={CX} cy={CY} r={r} fill="none" stroke={CREAM} strokeWidth={STROKE} opacity={0.35} />
        {/* Subtle track tint */}
        <circle cx={CX} cy={CY} r={r} fill="none" stroke={color} strokeWidth={STROKE} opacity={0.12} />

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

        {/* Knob handle — white circle at arc endpoint */}
        <circle
          cx={knob.x}
          cy={knob.y}
          r={8}
          fill="white"
          stroke={color}
          strokeWidth={2}
          style={{
            filter: `drop-shadow(0 1px 3px rgba(0,0,0,0.18))`,
            cursor: "grab",
          }}
        />

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
          {renderRing("fullness", OUTER_R, fullness, TEAL)}
          {renderRing("energy", MID_R, energy, PEACH)}
          {renderRing("hydration", INNER_R, hydration, BLUE)}

          {/* Logo center: cream bg + fullness fill + logo */}
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
              {/* Rising teal fill — multiply blend shows through the opaque PNG */}
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
      </div>
    </div>
  );
}
