import type { RingId } from "./DraggableRings";

const DEEP_TEAL = "#1F4E49";

const FULLNESS_PHRASES = [
  "Running on empty","Barely anything in","Room to spare","Softly satisfied","Easing in",
  "Comfortably fed","Noticing it now","Getting close","Full and floating","Heavy but hopeful","Past the ceiling",
];
const ENERGY_PHRASES = [
  "Flat out","Low battery","Low battery, still showing up","Slow start","Finding it","Steady",
  "Steady and warm","Picking up","Charged","Charged and clear","Fully lit",
];
const HYDRATION_PHRASES = [
  "Running dry","Barely a sip","Dry and dusty","Catching up",
  "Sipping along","Topped up","Hydrated and glowing","Cool and clear",
];
function hydrationPhrase(v: number): string {
  const idx = Math.round((v / 10) * 7);
  return HYDRATION_PHRASES[Math.max(0, Math.min(7, idx))];
}

interface StatusChipsProps {
  fullness: number;
  energy: number;
  hydration: number;
  activeRing?: RingId | null;
  activeColor?: string | null;
}

interface ChipProps {
  id: RingId;
  color: string;
  label: string;
  phrase: string;
  isActive: boolean;
  activeColor?: string | null;
}

function Chip({ id, color, label, phrase, isActive, activeColor }: ChipProps) {
  void id; // used by caller for identity
  const borderColor = isActive && activeColor ? activeColor : "rgba(58,143,136,0.12)";
  return (
    <div
      style={{
        flex: "1 1 0",
        minWidth: 0,
        background: isActive ? "rgba(255,255,255,0.92)" : "rgba(251,247,242,0.85)",
        border: `1px solid ${borderColor}`,
        borderRadius: "0.75rem",
        padding: "10px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        transform: isActive ? "translateY(-3px)" : "translateY(0)",
        transition: "border-color 220ms ease, background 220ms ease, transform 220ms ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span
          style={{
            display: "inline-block",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: color,
            flexShrink: 0,
            transition: "background 300ms ease",
          }}
        />
        <span
          className="font-sans"
          style={{
            fontSize: 9,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: DEEP_TEAL,
            opacity: 0.65,
            fontVariant: "small-caps",
          }}
        >
          {label}
        </span>
      </div>
      <span
        className="font-sans"
        style={{
          fontSize: 12,
          color: DEEP_TEAL,
          lineHeight: 1.3,
          fontWeight: 500,
        }}
      >
        {phrase}
      </span>
    </div>
  );
}

export default function StatusChips({
  fullness, energy, hydration,
  activeRing = null,
  activeColor = null,
}: StatusChipsProps) {
  const fPhrase = FULLNESS_PHRASES[Math.max(0, Math.min(10, Math.round(fullness)))];
  const ePhrase = ENERGY_PHRASES[Math.max(0, Math.min(10, Math.round(energy)))];
  const hPhrase = hydrationPhrase(hydration);

  // Live ring colors (interpolated, matching DraggableRings)
  function mix(a: string, b: string, t: number) {
    const h2r = (h: string): [number,number,number] =>
      [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
    const A = h2r(a), B = h2r(b);
    return `rgb(${Math.round(A[0]+(B[0]-A[0])*t)},${Math.round(A[1]+(B[1]-A[1])*t)},${Math.round(A[2]+(B[2]-A[2])*t)})`;
  }
  const fColor = mix("#BBD8D4", "#26706A", fullness / 10);
  const eColor = mix("#A3ADAB", "#FF9E52", energy / 10);
  const hColor = mix("#C4A483", "#3FA9D4", hydration / 10);

  return (
    <div style={{ display: "flex", gap: 8, width: "100%" }}>
      <Chip id="fullness"  color={fColor} label="Fullness"  phrase={fPhrase}
        isActive={activeRing === "fullness"}  activeColor={activeColor} />
      <Chip id="energy"    color={eColor} label="Energy"    phrase={ePhrase}
        isActive={activeRing === "energy"}    activeColor={activeColor} />
      <Chip id="hydration" color={hColor} label="Hydration" phrase={hPhrase}
        isActive={activeRing === "hydration"} activeColor={activeColor} />
    </div>
  );
}
