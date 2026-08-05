import { useRef, useCallback, useState, useEffect } from "react";

export type RingId = "fullness" | "energy" | "hydration";

interface DraggableRingsProps {
  fullness: number;   // 0–10
  energy: number;
  hydration: number;
  onFullnessChange: (v: number) => void;
  onEnergyChange: (v: number) => void;
  onHydrationChange: (v: number) => void;
  onActiveChange?: (ring: RingId | null) => void;
}

// ─── layout ───────────────────────────────────────────────────────────────────
const CX = 160;
const CY = 160;
const OUTER_R = 138;
const MID_R = 103;
const INNER_R = 68;
const CREAM = "#FBF7F2";

// Bowl is drawn in reference-space (center 200,200) then scaled to fit INNER_R
const BOWL_SCALE = INNER_R / 110;        // ≈ 0.618
const BOWL_T = `translate(${CX} ${CY}) scale(${BOWL_SCALE}) translate(-200 -200)`;

// ─── ring visual config ───────────────────────────────────────────────────────
const RING_CFG: Record<RingId, { r: number; lo: string; hi: string; track: string }> = {
  fullness:  { r: OUTER_R, lo: "#BBD8D4", hi: "#26706A", track: "rgba(58,143,136,.15)" },
  energy:    { r: MID_R,   lo: "#A3ADAB", hi: "#FF9E52", track: "rgba(240,165,118,.20)" },
  hydration: { r: INNER_R, lo: "#C4A483", hi: "#3FA9D4", track: "rgba(95,168,196,.20)"  },
};

// ─── phrase lookup (matches StatusChips) ─────────────────────────────────────
const F_PHRASES = [
  "Running on empty","Barely anything in","Room to spare","Softly satisfied","Easing in",
  "Comfortably fed","Noticing it now","Getting close","Full and floating","Heavy but hopeful","Past the ceiling",
];
const E_PHRASES = [
  "Flat out","Low battery","Low battery, still showing up","Slow start","Finding it","Steady",
  "Steady and warm","Picking up","Charged","Charged and clear","Fully lit",
];
const H_PHRASES_8 = [
  "Running dry","Barely a sip","Dry and dusty","Catching up",
  "Sipping along","Topped up","Hydrated and glowing","Cool and clear",
];
function getPhrase(ring: RingId, val: number): string {
  const i = Math.round(val);
  if (ring === "fullness")  return F_PHRASES[Math.max(0, Math.min(10, i))];
  if (ring === "energy")    return E_PHRASES[Math.max(0, Math.min(10, i))];
  const hi = Math.round((val / 10) * 7);
  return H_PHRASES_8[Math.max(0, Math.min(7, hi))];
}

// ─── utils ────────────────────────────────────────────────────────────────────
function hexToRgb(h: string): [number, number, number] {
  return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
}
export function mixColors(a: string, b: string, t: number): string {
  const A = hexToRgb(a), B = hexToRgb(b);
  return `rgb(${Math.round(A[0]+(B[0]-A[0])*t)},${Math.round(A[1]+(B[1]-A[1])*t)},${Math.round(A[2]+(B[2]-A[2])*t)})`;
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

// ─── component ────────────────────────────────────────────────────────────────
export default function DraggableRings({
  fullness, energy, hydration,
  onFullnessChange, onEnergyChange, onHydrationChange,
  onActiveChange,
}: DraggableRingsProps) {
  const svgRef        = useRef<SVGSVGElement>(null);
  const draggingRef   = useRef<RingId | null>(null);
  const activeRef     = useRef<RingId | null>(null);
  const tipTimerRef   = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Bowl animation refs
  const waterRef      = useRef<SVGPathElement | null>(null);
  const bubElemsRef   = useRef<(SVGCircleElement | null)[]>(Array(7).fill(null));
  const phaseRef      = useRef(0);
  const rafRef        = useRef(0);
  const valRef        = useRef({ f: fullness / 10, e: energy / 10, h: hydration / 10 });
  const bubDataRef    = useRef(
    Array.from({ length: 7 }, () => ({
      x: 162 + Math.random() * 76,
      ph: Math.random(),
      sp: 0.12 + Math.random() * 0.22,
      r: 1.6 + Math.random() * 2.4,
    }))
  );

  // Tooltip
  const [tip, setTip] = useState<{ text: string; kx: number; ky: number } | null>(null);

  // Active ring
  const [activeRing, setActiveRingState] = useState<RingId | null>(null);

  // Keep val ref current on every render
  valRef.current = { f: fullness / 10, e: energy / 10, h: hydration / 10 };

  // ── live colors ─────────────────────────────────────────────────────────────
  const fColor = mixColors("#BBD8D4", "#26706A", fullness / 10);
  const eColor = mixColors("#A3ADAB", "#FF9E52", energy / 10);
  const hColor = mixColors("#C4A483", "#3FA9D4", hydration / 10);
  const liveColor = (ring: RingId) => ring === "fullness" ? fColor : ring === "energy" ? eColor : hColor;

  // ── active ring management ───────────────────────────────────────────────────
  const setActive = useCallback((ring: RingId | null) => {
    if (ring === activeRef.current) return;
    activeRef.current = ring;
    setActiveRingState(ring);
    onActiveChange?.(ring);
  }, [onActiveChange]);

  // ── water + bubble rAF loop ──────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      const { f, h } = valRef.current;
      const water = waterRef.current;
      if (water) {
        const top = 176, bot = 244;
        const y = bot - (bot - top) * f;
        const amp = 1 + h * 5.5;
        phaseRef.current += 0.03 + h * 0.05;
        const p = phaseRef.current;
        const o = Math.sin(p) * 6;
        water.setAttribute("d",
          `M120 ${+(y + Math.sin(p) * amp).toFixed(2)}` +
          ` Q ${+(145 + o).toFixed(2)} ${+(y - amp * 1.6).toFixed(2)} 170 ${+y.toFixed(2)}` +
          ` T 220 ${+y.toFixed(2)} T 270 ${+y.toFixed(2)}` +
          ` T 320 ${+(y + Math.sin(p + 1) * amp).toFixed(2)}` +
          ` L 320 260 L 120 260 Z`
        );
        water.setAttribute("fill", mixColors("#9C7B54", "#3FB2CE", h));
        water.setAttribute("opacity", (0.6 + h * 0.3).toFixed(2));
      }
      bubElemsRef.current.forEach((el, i) => {
        if (!el) return;
        const { f, h } = valRef.current;
        const top = 176, bot = 244;
        const y = bot - (bot - top) * f;
        const b = bubDataRef.current[i];
        b.ph += b.sp * 0.012 * (0.3 + h);
        if (b.ph > 1) b.ph = 0;
        const by = bot - (bot - y - 4) * b.ph;
        el.setAttribute("cx", String(b.x));
        el.setAttribute("cy", String(by));
        el.setAttribute("opacity", (Math.max(0, h - 0.35) * 1.4 * (1 - b.ph)).toFixed(3));
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // ── pointer utils ────────────────────────────────────────────────────────────
  const getAngle = useCallback((clientX: number, clientY: number): number => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const r = svg.getBoundingClientRect();
    const sx = (clientX - r.left) * (320 / r.width);
    const sy = (clientY - r.top)  * (320 / r.height);
    let angle = Math.atan2(sx - CX, -(sy - CY)) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    return angle;
  }, []);

  const nearestRing = useCallback((clientX: number, clientY: number): RingId | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const sx = (clientX - rect.left) * (320 / rect.width);
    const sy = (clientY - rect.top)  * (320 / rect.height);
    const dist = Math.sqrt((sx - CX) ** 2 + (sy - CY) ** 2);
    let nearest: RingId | null = null;
    let minD = Infinity;
    for (const id of ["fullness", "energy", "hydration"] as RingId[]) {
      const d = Math.abs(dist - RING_CFG[id].r);
      if (d < 26 && d < minD) { minD = d; nearest = id; }
    }
    return nearest;
  }, []);

  const valueForRing = useCallback((ring: RingId) =>
    ring === "fullness" ? fullness : ring === "energy" ? energy : hydration,
  [fullness, energy, hydration]);

  const showTip = useCallback((ring: RingId, val: number) => {
    const { r } = RING_CFG[ring];
    const k = knobXY(r, (val / 10) * 360);
    setTip({ text: getPhrase(ring, val), kx: k.x, ky: k.y });
    if (tipTimerRef.current) clearTimeout(tipTimerRef.current);
  }, []);

  const scheduleTipHide = useCallback(() => {
    tipTimerRef.current = setTimeout(() => setTip(null), 1400);
  }, []);

  const applyPointer = useCallback((clientX: number, clientY: number) => {
    const ring = draggingRef.current;
    if (!ring) return;
    const angle = getAngle(clientX, clientY);
    const snapped = Math.round(Math.min(10, Math.max(0, (angle / 360) * 10)) * 2) / 2;
    if (ring === "fullness")  onFullnessChange(snapped);
    if (ring === "energy")    onEnergyChange(snapped);
    if (ring === "hydration") onHydrationChange(snapped);
    showTip(ring, snapped);
  }, [getAngle, onFullnessChange, onEnergyChange, onHydrationChange, showTip]);

  const handlePointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const ring = nearestRing(e.clientX, e.clientY);
    if (!ring) return;
    draggingRef.current = ring;
    (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
    setActive(ring);
    applyPointer(e.clientX, e.clientY);
  }, [nearestRing, setActive, applyPointer]);

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (draggingRef.current) {
      applyPointer(e.clientX, e.clientY);
    } else {
      setActive(nearestRing(e.clientX, e.clientY));
    }
  }, [applyPointer, nearestRing, setActive]);

  const handlePointerUp = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    draggingRef.current = null;
    (e.currentTarget as SVGSVGElement).releasePointerCapture(e.pointerId);
    scheduleTipHide();
    setTimeout(() => {
      if (!draggingRef.current) setActive(null);
    }, 900);
  }, [scheduleTipHide, setActive]);

  const handlePointerLeave = useCallback(() => {
    if (!draggingRef.current) setActive(null);
  }, [setActive]);

  // ── derived render values ─────────────────────────────────────────────────────
  const ePct = energy / 10;
  const hPct = hydration / 10;
  const eOn  = Math.max(0, (ePct - 0.5) * 2);        // 0→1 from energy 5→10
  const haloR = Math.round(INNER_R * 0.87);

  // ── ring renderer ─────────────────────────────────────────────────────────────
  function renderRing(id: RingId, val: number, color: string) {
    const { r, track } = RING_CFG[id];
    const pct  = val / 10;
    const endA = pct * 360;
    const arcD = pct >= 0.999 ? fullCircle(CX, CY, r)
               : pct < 0.001  ? null
               : describeArc(CX, CY, r, 0, endA);
    const knob = pct < 0.001 ? { x: CX, y: CY - r } : knobXY(r, endA);
    const sw   = 13 + pct * 6;
    const auraOpacity = pct * pct * 0.75;

    return (
      <g key={id} data-ring={id}>
        {/* Track */}
        <circle cx={CX} cy={CY} r={r} fill="none" stroke={track} strokeWidth={16} />

        {/* Aura (blurred) */}
        {arcD && auraOpacity > 0.02 && (
          <path d={arcD} fill="none" stroke={color} strokeWidth={sw + 7}
            strokeLinecap="round" opacity={auraOpacity} filter="url(#ring-glow)" />
        )}

        {/* Value arc */}
        {arcD && (
          <path d={arcD} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
            style={{ transition: "stroke 300ms ease, stroke-width 240ms ease" }} />
        )}

        {/* Knob */}
        <circle cx={knob.x} cy={knob.y} r={9} fill={CREAM} stroke={color} strokeWidth={2.5}
          style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.16))", cursor: "grab",
                   transition: "stroke 300ms ease" }} />

        {/* Wide invisible hit area */}
        <circle cx={CX} cy={CY} r={r} fill="none" stroke="transparent" strokeWidth={38}
          style={{ cursor: "pointer" }} />
      </g>
    );
  }

  // ── tooltip width estimate ────────────────────────────────────────────────────
  const tipW = tip ? tip.text.length * 7.2 + 20 : 0;

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="relative w-full max-w-xs mx-auto">
        <svg
          ref={svgRef}
          viewBox="0 0 320 320"
          width="100%"
          style={{ display: "block", touchAction: "none", cursor: "crosshair", overflow: "visible" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerLeave}
        >
          <defs>
            {/* Clip path for bowl water — coordinates are in reference space (200,200 center),
                which is correct because this clipPath will be referenced from inside BOWL_T group */}
            <clipPath id="bowl-clip">
              <path d="M148 176 L252 176 C252 228 231 244 200 244 C169 244 148 228 148 176 Z" />
            </clipPath>
            <filter id="ring-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="7" />
            </filter>
            <filter id="halo-blur" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="14" />
            </filter>
          </defs>

          {/* Energy halo — behind all rings */}
          <circle cx={CX} cy={CY} r={haloR} fill="#FFB073"
            opacity={+(Math.max(0, ePct - 0.42) * 0.62).toFixed(3)}
            filter="url(#halo-blur)" />

          {/* Energy rays — 12 lines around the ring stack */}
          {Array.from({ length: 12 }, (_, i) => {
            const a   = (i / 12) * Math.PI * 2;
            const len = OUTER_R + 8 + eOn * 16;
            const x1  = CX + Math.cos(a) * (OUTER_R + 5);
            const y1  = CY + Math.sin(a) * (OUTER_R + 5);
            const opacity = eOn * (0.35 + 0.65 * Math.abs(Math.sin(i * 1.7)));
            return (
              <line key={i} x1={x1} y1={y1}
                x2={CX + Math.cos(a) * len} y2={CY + Math.sin(a) * len}
                stroke="#FF9E52" strokeWidth={2.5} strokeLinecap="round"
                opacity={+opacity.toFixed(3)} />
            );
          })}

          {/* Rings (outermost first so inner renders on top) */}
          {renderRing("fullness",  fullness,  fColor)}
          {renderRing("energy",    energy,    eColor)}
          {renderRing("hydration", hydration, hColor)}

          {/* Bowl center — everything in reference-space (200,200), scaled via BOWL_T */}
          <g transform={BOWL_T}>
            {/* Dish plate */}
            <circle cx={200} cy={200} r={86}
              fill={`rgba(255,255,255,${+(0.4 + hPct * 0.32).toFixed(2)})`} />

            {/* Water fill + bubbles — clipped to bowl shape */}
            <g clipPath="url(#bowl-clip)">
              <path ref={waterRef} d="" fill="#3A8F88" opacity="0.85" />
              {Array.from({ length: 7 }, (_, i) => (
                <circle key={i}
                  ref={el => { bubElemsRef.current[i] = el; }}
                  r={bubDataRef.current[i].r}
                  fill="#EAF7FB" opacity={0} />
              ))}
            </g>

            {/* Leaves — render ABOVE water */}
            <path d="M194 175 C180 171 169 159 168 142 C183 145 193 158 194 175 Z" fill="#2E7C74" />
            <path d="M206 175 C220 171 231 159 232 142 C217 145 207 158 206 175 Z" fill="#2E7C74" />

            {/* Seed — energy-reactive */}
            <circle cx={200} cy={142}
              r={+(6 + ePct * 4.5).toFixed(1)}
              fill={mixColors("#C9A98F", "#FFB073", ePct)}
              opacity={+(0.35 + ePct * 0.65).toFixed(2)} />
            <ellipse cx={200} cy={163} rx={4} ry={7}
              fill="#F0A576" opacity={+(0.3 + ePct * 0.6).toFixed(2)} />

            {/* Bowl outline — always on top */}
            <path d="M148 176 L252 176 C252 228 231 244 200 244 C169 244 148 228 148 176 Z"
              fill="none" stroke="#2E7C74" strokeWidth={2.5} opacity={0.45} />
          </g>

          {/* Drag tooltip */}
          {tip && (
            <g style={{ pointerEvents: "none" }}>
              <rect
                x={tip.kx - tipW / 2}
                y={tip.ky - 43}
                width={tipW}
                height={26}
                rx={9}
                fill="#1F4E49"
              />
              <text
                x={tip.kx}
                y={tip.ky - 30}
                fill={CREAM}
                fontSize={12}
                fontFamily="Lato, sans-serif"
                fontWeight="700"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {tip.text}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
