import { useRef, useCallback, useState, useEffect, useId } from "react";
import type { RingId } from "@/lib/reflections";
import { fullnessPhrase, energyPhrase, hydrationPhrase } from "@/lib/reflections";

// Drag mechanics + bowl animation ported from the FeelFed marketing site
// (artifacts/feelfed-hero/src/components/DraggableRings.tsx). The colours used
// inside the SVG are the FeelFed palette values that back the feelfed-ds tokens
// (teal #3A8F88, deep teal #1F4E49, peach #F0A576, water-blue #5FA8C4, cream
// #FBF7F2) — SVG strokes/fills can't take Tailwind classes, so the token hexes
// live here; every surrounding surface uses design-system tokens/components.

interface DraggableRingsProps {
  fullness: number; // 0-10
  energy: number;
  hydration: number;
  onFullnessChange: (v: number) => void;
  onEnergyChange: (v: number) => void;
  onHydrationChange: (v: number) => void;
  onActiveChange?: (ring: RingId | null) => void;
}

// ─── layout ───
const CX = 160;
const CY = 160;
const OUTER_R = 138;
const MID_R = 103;
const INNER_R = 68;
const CREAM = "#FBF7F2";

const BOWL_SCALE = INNER_R / 110;
const BOWL_T = `translate(${CX} ${CY}) scale(${BOWL_SCALE}) translate(-200 -200)`;
const vpX = (rx: number) => CX + (rx - 200) * BOWL_SCALE;
const vpY = (ry: number) => CY + (ry - 200) * BOWL_SCALE;

const RING_CFG: Record<RingId, { r: number; lo: string; hi: string; track: string }> = {
  fullness: { r: OUTER_R, lo: "#BBD8D4", hi: "#26706A", track: "rgba(58,143,136,.15)" },
  energy: { r: MID_R, lo: "#A3ADAB", hi: "#FF9E52", track: "rgba(240,165,118,.20)" },
  hydration: { r: INNER_R, lo: "#C4A483", hi: "#3FA9D4", track: "rgba(95,168,196,.20)" },
};

function phraseFor(ring: RingId, val: number): string {
  if (ring === "fullness") return fullnessPhrase(val);
  if (ring === "energy") return energyPhrase(val);
  return hydrationPhrase(val);
}

// ─── utils ───
function hexToRgb(h: string): [number, number, number] {
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
}
export function mixColors(a: string, b: string, t: number): string {
  const A = hexToRgb(a), B = hexToRgb(b);
  return `rgb(${Math.round(A[0] + (B[0] - A[0]) * t)},${Math.round(A[1] + (B[1] - A[1]) * t)},${Math.round(A[2] + (B[2] - A[2]) * t)})`;
}

export function ringColor(ring: RingId, v: number): string {
  const c = RING_CFG[ring];
  return mixColors(c.lo, c.hi, Math.max(0, Math.min(1, v / 10)));
}

function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startDeg));
  const y1 = cy + r * Math.sin(toRad(startDeg));
  const x2 = cx + r * Math.cos(toRad(endDeg));
  const y2 = cy + r * Math.sin(toRad(endDeg));
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}
function fullCircle(cx: number, cy: number, r: number): string {
  return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.001} ${cy - r}`;
}
function knobXY(r: number, valueDeg: number): { x: number; y: number } {
  const rad = ((valueDeg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

const BOWL_CLIP_D = [
  `M${vpX(148).toFixed(2)} ${vpY(176).toFixed(2)}`,
  `L${vpX(252).toFixed(2)} ${vpY(176).toFixed(2)}`,
  `C${vpX(252).toFixed(2)} ${vpY(228).toFixed(2)} ${vpX(231).toFixed(2)} ${vpY(244).toFixed(2)} ${vpX(200).toFixed(2)} ${vpY(244).toFixed(2)}`,
  `C${vpX(169).toFixed(2)} ${vpY(244).toFixed(2)} ${vpX(148).toFixed(2)} ${vpY(228).toFixed(2)} ${vpX(148).toFixed(2)} ${vpY(176).toFixed(2)}`,
  `Z`,
].join(" ");

export default function DraggableRings({
  fullness, energy, hydration,
  onFullnessChange, onEnergyChange, onHydrationChange,
  onActiveChange,
}: DraggableRingsProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const draggingRef = useRef<RingId | null>(null);
  const activeRef = useRef<RingId | null>(null);
  const tipTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const waterRef = useRef<SVGPathElement | null>(null);
  const bubElemsRef = useRef<(SVGCircleElement | null)[]>(Array(7).fill(null));
  const phaseRef = useRef(0);
  const rafRef = useRef(0);
  const valRef = useRef({ f: fullness / 10, e: energy / 10, h: hydration / 10 });

  const bubDataRef = useRef(
    Array.from({ length: 7 }, () => ({
      x: CX + (-38 + Math.random() * 76) * BOWL_SCALE,
      ph: Math.random(),
      sp: 0.12 + Math.random() * 0.22,
      r: (1.6 + Math.random() * 2.4) * BOWL_SCALE,
    })),
  );

  const [tip, setTip] = useState<{ text: string; kx: number; ky: number } | null>(null);
  const [activeRing, setActiveRingState] = useState<RingId | null>(null);
  const [dragRing, setDragRing] = useState<RingId | null>(null);

  const [loadPulse, setLoadPulse] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const interactedRef = useRef(false);

  useEffect(() => {
    const t1 = setTimeout(() => { if (!interactedRef.current) setLoadPulse(true); }, 1400);
    const t2 = setTimeout(() => { if (!interactedRef.current) setShowHint(true); }, 1700);
    const t3 = setTimeout(() => setLoadPulse(false), 6000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const dismissHint = useCallback(() => {
    interactedRef.current = true;
    setShowHint(false);
    setLoadPulse(false);
  }, []);

  valRef.current = { f: fullness / 10, e: energy / 10, h: hydration / 10 };

  const fColor = ringColor("fullness", fullness);
  const eColor = ringColor("energy", energy);
  const hColor = ringColor("hydration", hydration);

  const setActive = useCallback((ring: RingId | null) => {
    if (ring === activeRef.current) return;
    activeRef.current = ring;
    setActiveRingState(ring);
    onActiveChange?.(ring);
  }, [onActiveChange]);

  // water + bubble rAF loop
  useEffect(() => {
    const tick = () => {
      const { f, h } = valRef.current;
      const yRef = 244 - 68 * f;
      const yVp = vpY(yRef);
      const ampVp = (1.6 + h * 8) * BOWL_SCALE;
      phaseRef.current += 0.035 + h * 0.085;
      const p = phaseRef.current;
      const oVp = Math.sin(p) * 6 * BOWL_SCALE;

      const water = waterRef.current;
      if (water) {
        const t = (v: number) => v.toFixed(2);
        water.setAttribute("d",
          `M${t(vpX(120))} ${t(yVp + Math.sin(p) * ampVp)}` +
          ` Q${t(vpX(145) + oVp)} ${t(yVp - ampVp * 1.6)} ${t(vpX(170))} ${t(yVp)}` +
          ` T${t(vpX(220))} ${t(yVp)} T${t(vpX(270))} ${t(yVp)}` +
          ` T${t(vpX(320))} ${t(yVp + Math.sin(p + 1) * ampVp)}` +
          ` L${t(vpX(320))} ${t(vpY(260))} L${t(vpX(120))} ${t(vpY(260))} Z`,
        );
        water.setAttribute("fill", mixColors("#7FB0AA", "#3FB2CE", h));
        water.setAttribute("opacity", (0.6 + h * 0.3).toFixed(2));
      }

      bubElemsRef.current.forEach((el, i) => {
        if (!el) return;
        const b = bubDataRef.current[i];
        b.ph += b.sp * 0.012 * (0.3 + h);
        if (b.ph > 1) b.ph = 0;
        const byRef = 244 - (244 - yRef - 4) * b.ph;
        el.setAttribute("cx", String(b.x.toFixed(2)));
        el.setAttribute("cy", String(vpY(byRef).toFixed(2)));
        el.setAttribute("opacity", (Math.max(0, h - 0.35) * 1.4 * (1 - b.ph)).toFixed(3));
      });

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const getAngle = useCallback((clientX: number, clientY: number): number => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const r = svg.getBoundingClientRect();
    const sx = (clientX - r.left) * (320 / r.width);
    const sy = (clientY - r.top) * (320 / r.height);
    let angle = Math.atan2(sx - CX, -(sy - CY)) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    return angle;
  }, []);

  const nearestRing = useCallback((clientX: number, clientY: number): RingId | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const sx = (clientX - rect.left) * (320 / rect.width);
    const sy = (clientY - rect.top) * (320 / rect.height);
    const dist = Math.sqrt((sx - CX) ** 2 + (sy - CY) ** 2);
    let nearest: RingId | null = null;
    let minD = Infinity;
    for (const id of ["fullness", "energy", "hydration"] as RingId[]) {
      const d = Math.abs(dist - RING_CFG[id].r);
      if (d < 26 && d < minD) { minD = d; nearest = id; }
    }
    return nearest;
  }, []);

  const showTip = useCallback((ring: RingId, val: number) => {
    const { r } = RING_CFG[ring];
    const k = knobXY(r, (val / 10) * 360);
    setTip({ text: phraseFor(ring, val), kx: k.x, ky: k.y });
    if (tipTimerRef.current) clearTimeout(tipTimerRef.current);
  }, []);

  const scheduleTipHide = useCallback(() => {
    tipTimerRef.current = setTimeout(() => setTip(null), 1400);
  }, []);

  const setRing = useCallback((ring: RingId, v: number) => {
    if (ring === "fullness") onFullnessChange(v);
    if (ring === "energy") onEnergyChange(v);
    if (ring === "hydration") onHydrationChange(v);
  }, [onFullnessChange, onEnergyChange, onHydrationChange]);

  const applyPointer = useCallback((clientX: number, clientY: number) => {
    const ring = draggingRef.current;
    if (!ring) return;
    const angle = getAngle(clientX, clientY);
    const snapped = Math.round(Math.min(10, Math.max(0, (angle / 360) * 10)) * 2) / 2;
    setRing(ring, snapped);
    showTip(ring, snapped);
  }, [getAngle, setRing, showTip]);

  const handlePointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    e.preventDefault();
    const ring = nearestRing(e.clientX, e.clientY);
    if (!ring) return;
    dismissHint();
    draggingRef.current = ring;
    setDragRing(ring);
    (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
    setActive(ring);
    applyPointer(e.clientX, e.clientY);
  }, [nearestRing, setActive, applyPointer, dismissHint]);

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (draggingRef.current) {
      applyPointer(e.clientX, e.clientY);
    } else {
      setActive(nearestRing(e.clientX, e.clientY));
    }
  }, [applyPointer, nearestRing, setActive]);

  const handlePointerUp = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    draggingRef.current = null;
    setDragRing(null);
    (e.currentTarget as SVGSVGElement).releasePointerCapture(e.pointerId);
    scheduleTipHide();
    setTimeout(() => {
      if (!draggingRef.current) setActive(null);
    }, 900);
  }, [scheduleTipHide, setActive]);

  const handlePointerLeave = useCallback(() => {
    if (!draggingRef.current) setActive(null);
  }, [setActive]);

  // ── keyboard access: focus a ring, arrows adjust by 0.5, Home/End jump ──
  const valueOf = (ring: RingId) =>
    ring === "fullness" ? fullness : ring === "energy" ? energy : hydration;

  const handleKnobKey = useCallback((ring: RingId, e: React.KeyboardEvent) => {
    let v = valueOf(ring);
    let handled = true;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        v = Math.min(10, v + 0.5);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        v = Math.max(0, v - 0.5);
        break;
      case "Home":
        v = 0;
        break;
      case "End":
        v = 10;
        break;
      default:
        handled = false;
    }
    if (!handled) return;
    e.preventDefault();
    dismissHint();
    setActive(ring);
    setRing(ring, v);
    showTip(ring, v);
    scheduleTipHide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullness, energy, hydration, dismissHint, setActive, setRing, showTip, scheduleTipHide]);

  const uid = useId();
  const clipId = `bowl-clip${uid}`;
  const glowId = `ring-glow${uid}`;
  const haloId = `halo-blur${uid}`;

  const ePct = energy / 10;
  const hPct = hydration / 10;
  const eOn = Math.max(0, (ePct - 0.5) * 2);
  const haloR = Math.round(INNER_R * 0.87);

  function renderRing(id: RingId, val: number, color: string) {
    const { r, track } = RING_CFG[id];
    const pct = val / 10;
    const endA = pct * 360;
    const arcD = pct >= 0.999 ? fullCircle(CX, CY, r)
      : pct < 0.001 ? null
        : describeArc(CX, CY, r, 0, endA);
    const knob = pct < 0.001 ? { x: CX, y: CY - r } : knobXY(r, endA);
    const sw = 13 + pct * 6;
    const auraOpacity = pct * pct * 0.75;
    const isDraggingThis = dragRing === id;
    const isActiveThis = activeRing === id;
    const trailD = isDraggingThis && endA > 4
      ? describeArc(CX, CY, r, Math.max(0, endA - 42), endA)
      : null;
    const label = `${id.charAt(0).toUpperCase()}${id.slice(1)}: ${val} of 10, ${phraseFor(id, val).toLowerCase()}`;

    return (
      <g key={id} data-ring={id}>
        <circle cx={CX} cy={CY} r={r} fill="none" stroke={track} strokeWidth={16} />
        {arcD && auraOpacity > 0.02 && (
          <path d={arcD} fill="none" stroke={color} strokeWidth={sw + 7}
            strokeLinecap="round" opacity={auraOpacity} filter={`url(#${glowId})`} />
        )}
        {arcD && (
          <path d={arcD} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
            style={{ transition: "stroke 300ms ease, stroke-width 240ms ease" }} />
        )}
        {trailD && (
          <path d={trailD} fill="none" stroke={color} strokeWidth={sw + 12}
            strokeLinecap="round" opacity={0.55} filter={`url(#${glowId})`}
            style={{ pointerEvents: "none" }} />
        )}
        <circle cx={knob.x} cy={knob.y} r={isDraggingThis ? 20 : isActiveThis ? 17 : 14}
          fill={color} filter={`url(#${glowId})`}
          opacity={isDraggingThis ? 0.7 : isActiveThis ? 0.5 : 0.3}
          style={{ pointerEvents: "none", transition: "opacity 200ms ease" }} />
        {loadPulse && (
          <circle cx={knob.x} cy={knob.y} r={10} fill="none" stroke={color} strokeWidth={2}
            className="feelfed-knob-pulse" style={{ pointerEvents: "none" }} />
        )}
        {/* Focusable, keyboard-adjustable knob (slider semantics) */}
        <circle
          cx={knob.x} cy={knob.y} r={isDraggingThis ? 11 : 9} fill={CREAM}
          stroke={color} strokeWidth={isDraggingThis ? 3.5 : 2.5}
          role="slider"
          tabIndex={0}
          aria-label={`${id} level`}
          aria-valuemin={0}
          aria-valuemax={10}
          aria-valuenow={val}
          aria-valuetext={label}
          onKeyDown={(e) => handleKnobKey(id, e)}
          onFocus={() => setActive(id)}
          style={{
            filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.16))", cursor: "grab", outline: "none",
            transition: "stroke 300ms ease, r 150ms ease, stroke-width 150ms ease",
          }}
          className="feelfed-knob-focus"
        />
        <circle cx={CX} cy={CY} r={r} fill="none" stroke="transparent" strokeWidth={38}
          style={{ cursor: "pointer" }} />
      </g>
    );
  }

  const tipW = tip ? tip.text.length * 7.2 + 20 : 0;

  return (
    <div className="relative w-full flex flex-col items-center select-none">
      <div className="relative w-full max-w-[280px] mx-auto">
        <svg
          ref={svgRef}
          viewBox="0 0 320 320"
          width="100%"
          role="group"
          aria-label="Fullness, energy and hydration rings. Drag each ring or use arrow keys."
          style={{
            display: "block", touchAction: "none", cursor: "crosshair", overflow: "visible",
            userSelect: "none", WebkitUserSelect: "none",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerLeave}
        >
          <defs>
            <clipPath id={clipId}>
              <path d={BOWL_CLIP_D} />
            </clipPath>
            <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="7" />
            </filter>
            <filter id={haloId} x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="14" />
            </filter>
          </defs>

          <circle cx={CX} cy={CY} r={haloR} fill="#FFB073"
            opacity={+(Math.max(0, ePct - 0.42) * 0.62).toFixed(3)}
            filter={`url(#${haloId})`} />

          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const len = OUTER_R + 8 + eOn * 16;
            const x1 = CX + Math.cos(a) * (OUTER_R + 5);
            const y1 = CY + Math.sin(a) * (OUTER_R + 5);
            const opacity = eOn * (0.35 + 0.65 * Math.abs(Math.sin(i * 1.7)));
            return (
              <line key={i} x1={x1} y1={y1}
                x2={CX + Math.cos(a) * len} y2={CY + Math.sin(a) * len}
                stroke="#FF9E52" strokeWidth={2.5} strokeLinecap="round"
                opacity={+opacity.toFixed(3)} />
            );
          })}

          {renderRing("fullness", fullness, fColor)}
          {renderRing("energy", energy, eColor)}
          {renderRing("hydration", hydration, hColor)}

          <g transform={BOWL_T}>
            <circle cx={200} cy={200} r={86}
              fill={`rgba(255,255,255,${+(0.4 + hPct * 0.32).toFixed(2)})`} />
          </g>

          <g clipPath={`url(#${clipId})`}>
            <path ref={waterRef} d="" fill="#3A8F88" opacity="0.85" />
            {Array.from({ length: 7 }, (_, i) => (
              <circle key={i}
                ref={(el) => { bubElemsRef.current[i] = el; }}
                r={bubDataRef.current[i].r}
                fill="#EAF7FB" opacity={0} />
            ))}
          </g>

          <g transform={BOWL_T}>
            <path d="M194 175 C180 171 169 159 168 142 C183 145 193 158 194 175 Z" fill="#2E7C74" />
            <path d="M206 175 C220 171 231 159 232 142 C217 145 207 158 206 175 Z" fill="#2E7C74" />
            <circle cx={200} cy={142}
              r={+(6 + ePct * 4.5).toFixed(1)}
              fill={mixColors("#C9A98F", "#FFB073", ePct)}
              opacity={+(0.35 + ePct * 0.65).toFixed(2)} />
            <ellipse cx={200} cy={163} rx={4} ry={7}
              fill="#F0A576" opacity={+(0.3 + ePct * 0.6).toFixed(2)} />
            <path d="M148 176 L252 176 C252 228 231 244 200 244 C169 244 148 228 148 176 Z"
              fill="none" stroke="#2E7C74" strokeWidth={2.5} opacity={0.45} />
          </g>

          {showHint && !tip && !dragRing && (() => {
            const endA = (fullness / 10) * 360;
            const k = fullness < 0.05 ? { x: CX, y: CY - OUTER_R } : knobXY(OUTER_R, endA);
            const dx = k.x - CX, dy = k.y - CY;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const bx = k.x + (dx / len) * 34;
            const by = k.y + (dy / len) * 24;
            return (
              <g className="feelfed-hint-float" style={{ pointerEvents: "none" }}>
                <rect x={bx - 38} y={by - 14} width={76} height={28} rx={14}
                  fill="rgba(255,255,255,0.95)" stroke="rgba(58,143,136,0.35)" strokeWidth={1} />
                <text x={bx} y={by + 1} fill="#1F4E49" fontSize={12}
                  fontFamily="Poppins, sans-serif" fontWeight="600"
                  textAnchor="middle" dominantBaseline="middle">
                  Drag me
                </text>
              </g>
            );
          })()}

          {tip && (() => {
            const dx = tip.kx - CX, dy = tip.ky - CY;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            let bx = tip.kx + (dx / len) * 30;
            let by = tip.ky + (dy / len) * 26;
            bx = Math.max(tipW / 2 - 24, Math.min(320 - tipW / 2 + 24, bx));
            by = Math.max(-6, Math.min(334, by));
            return (
              <g style={{ pointerEvents: "none" }}>
                <rect x={bx - tipW / 2} y={by - 13} width={tipW} height={26} rx={9} fill="#1F4E49" />
                <text x={bx} y={by} fill={CREAM} fontSize={12}
                  fontFamily="Lato, sans-serif" fontWeight="700"
                  textAnchor="middle" dominantBaseline="middle">
                  {tip.text}
                </text>
              </g>
            );
          })()}
        </svg>
        <style>{`
          .feelfed-knob-focus:focus-visible {
            stroke-width: 3.5;
            filter: drop-shadow(0 0 0 3px rgba(58,143,136,0.35)) drop-shadow(0 1px 3px rgba(0,0,0,0.16));
          }
          .feelfed-knob-pulse {
            transform-box: fill-box;
            transform-origin: center;
            animation: feelfed-pulse 1.6s ease-out 3;
          }
          @keyframes feelfed-pulse {
            0%   { transform: scale(1);   opacity: 0.8; }
            70%  { transform: scale(2.4); opacity: 0; }
            100% { transform: scale(2.4); opacity: 0; }
          }
          .feelfed-hint-float { animation: feelfed-hint-bob 2.2s ease-in-out infinite; }
          @keyframes feelfed-hint-bob {
            0%, 100% { transform: translateY(0); }
            50%      { transform: translateY(-4px); }
          }
          @media (prefers-reduced-motion: reduce) {
            .feelfed-knob-pulse, .feelfed-hint-float { animation: none; }
          }
        `}</style>
      </div>
    </div>
  );
}
