const TEAL = "#3A8F88";
const PEACH = "#F0A576";
const BLUE = "#5FA8C4";
const DEEP_TEAL = "#1F4E49";

const FULLNESS_PHRASES = [
  "Running on empty",        // 0
  "Barely anything in",      // 1
  "Room to spare",           // 2
  "Softly satisfied",        // 3
  "Easing in",               // 4
  "Comfortably fed",         // 5
  "Noticing it now",         // 6
  "Getting close",           // 7
  "Full and floating",       // 8
  "Heavy but hopeful",       // 9
  "Past the ceiling",        // 10
];

const ENERGY_PHRASES = [
  "Flat out",                      // 0
  "Low battery",                   // 1
  "Low battery, still showing up", // 2
  "Slow start",                    // 3
  "Finding it",                    // 4
  "Steady",                        // 5
  "Steady and warm",               // 6
  "Picking up",                    // 7
  "Charged",                       // 8
  "Charged and clear",             // 9
  "Fully lit",                     // 10
];

// 8 phrases mapped across 0–10 (index = Math.round(v * 7/10))
const HYDRATION_PHRASES = [
  "Running dry",       // 0
  "Barely a sip",      // 1
  "Dry and dusty",     // 2
  "Catching up",       // 3
  "Sipping along",     // 4
  "Topped up",         // 5
  "Hydrated and glowing", // 6
  "Cool and clear",    // 7
];

function hydrationPhrase(v: number): string {
  const idx = Math.round((v / 10) * 7);
  return HYDRATION_PHRASES[Math.max(0, Math.min(7, idx))];
}

interface StatusChipsProps {
  fullness: number;
  energy: number;
  hydration: number;
}

interface ChipProps {
  color: string;
  label: string;
  phrase: string;
}

function Chip({ color, label, phrase }: ChipProps) {
  return (
    <div
      style={{
        flex: "1 1 0",
        minWidth: 0,
        background: "rgba(251,247,242,0.85)",
        border: "1px solid rgba(58,143,136,0.12)",
        borderRadius: "0.75rem",
        padding: "10px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
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

export default function StatusChips({ fullness, energy, hydration }: StatusChipsProps) {
  const fPhrase = FULLNESS_PHRASES[Math.max(0, Math.min(10, Math.round(fullness)))];
  const ePhrase = ENERGY_PHRASES[Math.max(0, Math.min(10, Math.round(energy)))];
  const hPhrase = hydrationPhrase(hydration);

  return (
    <div style={{ display: "flex", gap: 8, width: "100%" }}>
      <Chip color={TEAL}  label="Fullness"  phrase={fPhrase} />
      <Chip color={PEACH} label="Energy"    phrase={ePhrase} />
      <Chip color={BLUE}  label="Hydration" phrase={hPhrase} />
    </div>
  );
}
