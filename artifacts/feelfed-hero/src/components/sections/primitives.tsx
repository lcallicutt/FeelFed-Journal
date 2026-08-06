import { useReveal, revealStyle } from "./useReveal";

/* ── Mockup palette (mapped to DS tokens where a token exists) ─────────────
 * cream #FBF7F2 -> --background   ink #1F4E49 -> --secondary/--foreground
 * teal #3A8F88  -> --primary      peach #F0A576 -> --accent
 * water #5FA8C4 -> --chart-1
 * The remaining values below are fine-grained one-offs from the mockup that
 * have no matching token; kept as literals so the design reads faithfully. */
export const C = {
  cream: "#FBF7F2",
  paper: "#F6F1EA",
  teal: "#3A8F88",
  tealDeep: "#2E7C74",
  ink: "#1F4E49",
  peach: "#F0A576",
  water: "#4FA9C6",
  muted: "#6E8481",
  subhead: "#3D5C58",
  body: "#4C6D69",
} as const;

/** Reveal wrapper — one IntersectionObserver-backed element. */
export function Reveal({
  index = 0,
  className,
  style,
  children,
}: {
  index?: number;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const { ref, shown } = useReveal();
  return (
    <div ref={ref} className={className} style={{ ...revealStyle(shown, index), ...style }}>
      {children}
    </div>
  );
}

/** Section heading block: kicker + h2 (with optional em) + optional subhead. */
export function SecHead({
  kicker,
  kickerColor = C.tealDeep,
  ruleColor = C.teal,
  title,
  em,
  titleTail,
  h2Color = C.ink,
  emColor = C.tealDeep,
  subhead,
  subheadColor = C.subhead,
  center = false,
  maxWidth = "34ch",
  index = 0,
}: {
  kicker: string;
  kickerColor?: string;
  ruleColor?: string;
  title: string;
  em?: string;
  titleTail?: string;
  h2Color?: string;
  emColor?: string;
  subhead?: string;
  subheadColor?: string;
  center?: boolean;
  maxWidth?: string;
  index?: number;
}) {
  return (
    <Reveal
      index={index}
      className="font-mono"
      style={{
        marginBottom: center ? 34 : 72,
        maxWidth,
        ...(center ? { marginLeft: "auto", marginRight: "auto", textAlign: "center" } : {}),
      }}
    >
      <div
        className="font-sans"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.17em",
          textTransform: "uppercase",
          color: kickerColor,
          marginBottom: 18,
          ...(center ? { justifyContent: "center" } : {}),
        }}
      >
        <span style={{ width: 26, height: 1, background: ruleColor, flex: "none" }} />
        {kicker}
      </div>
      <h2
        className="font-serif"
        style={{
          fontWeight: 300,
          fontSize: "clamp(36px,4.4vw,58px)",
          lineHeight: 1.02,
          letterSpacing: "-0.025em",
          color: h2Color,
          margin: 0,
          ...(center ? { maxWidth: "none" } : {}),
        }}
      >
        {title}
        {em && (
          <>
            {" "}
            <em style={{ fontStyle: "italic", fontWeight: 500, color: emColor }}>{em}</em>
          </>
        )}
        {titleTail ? ` ${titleTail}` : ""}
      </h2>
      {subhead && (
        <p
          style={{
            marginTop: 18,
            fontSize: 18,
            lineHeight: 1.6,
            color: subheadColor,
            maxWidth: "44ch",
            ...(center ? { marginLeft: "auto", marginRight: "auto" } : {}),
          }}
        >
          {subhead}
        </p>
      )}
    </Reveal>
  );
}

/* ── Phone mockup building blocks ──────────────────────────────────────── */

export function Phone({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        width: 264,
        aspectRatio: "264 / 540",
        flex: "none",
        background: "#1A2A28",
        borderRadius: 38,
        padding: 9,
        boxShadow:
          "0 2px 4px rgba(31,78,73,.1), 0 34px 60px -30px rgba(31,78,73,.5)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 8,
          left: "50%",
          transform: "translateX(-50%)",
          width: 74,
          height: 19,
          background: "#1A2A28",
          borderRadius: 99,
          zIndex: 4,
        }}
      />
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          background: C.cream,
          borderRadius: 30,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function StatusBar({ time }: { time: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "11px 18px 4px",
        fontSize: 10,
        fontWeight: 700,
        color: C.ink,
        opacity: 0.75,
      }}
    >
      <span>{time}</span>
      <span aria-hidden>▪▪▪ ⌁</span>
    </div>
  );
}

export function AppTop({ title }: { title: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 16px 10px",
      }}
    >
      <span
        aria-hidden
        style={{
          position: "relative",
          width: 15,
          height: 2,
          background: C.ink,
          opacity: 0.4,
          borderRadius: 2,
          boxShadow: `0 -4px 0 ${C.ink}, 0 4px 0 ${C.ink}`,
        }}
      />
      <span className="font-serif" style={{ fontSize: 14, fontWeight: 500, color: C.ink }}>
        {title}
      </span>
      <span
        style={{ width: 19, height: 19, borderRadius: "50%", background: "rgba(58,143,136,.18)" }}
      />
    </div>
  );
}

export function PhoneBody({ children }: { children: React.ReactNode }) {
  return <div style={{ flex: 1, padding: "4px 15px 12px", overflow: "hidden" }}>{children}</div>;
}

export function TabBar({ active }: { active: "Today" | "History" | "Trends" | "You" }) {
  const tabs: Array<typeof active> = ["Today", "History", "Trends", "You"];
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "9px 0 13px",
        borderTop: "1px solid rgba(58,143,136,.13)",
        background: "rgba(255,255,255,.5)",
      }}
    >
      {tabs.map((t) => {
        const on = t === active;
        return (
          <div
            key={t}
            className="font-sans"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              fontSize: 8,
              color: on ? C.tealDeep : C.muted,
            }}
          >
            <span
              style={{
                width: 15,
                height: 15,
                borderRadius: 4,
                background: "currentColor",
                opacity: on ? 0.65 : 0.28,
              }}
            />
            {t}
          </div>
        );
      })}
    </div>
  );
}

export function QLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-sans"
      style={{
        fontSize: 9,
        fontWeight: 500,
        letterSpacing: "0.13em",
        textTransform: "uppercase",
        color: C.muted,
        margin: "12px 0 7px",
      }}
    >
      {children}
    </div>
  );
}

export function QTitle({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      className="font-serif"
      style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.22, marginBottom: 3, color: C.ink, ...style }}
    >
      {children}
    </div>
  );
}

export function QSub({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10.5, lineHeight: 1.45, color: C.body, marginBottom: 12 }}>{children}</div>
  );
}

/** Segmented scale: `filled` bars out of 10, accent variant sets colour. */
export function Scale({
  filled,
  variant = "teal",
}: {
  filled: number;
  variant?: "teal" | "peach" | "water";
}) {
  const fillColor = variant === "peach" ? C.peach : variant === "water" ? C.water : C.teal;
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          style={{
            flex: 1,
            height: 7,
            borderRadius: 99,
            background: i < filled ? fillColor : "rgba(58,143,136,.15)",
          }}
        />
      ))}
    </div>
  );
}

export function ScaleFoot({ left, right }: { left: string; right: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: 8.5,
        color: C.muted,
        marginBottom: 13,
      }}
    >
      <span>{left}</span>
      <span>{right}</span>
    </div>
  );
}

export type ChipDef = { label: string; on?: boolean; peach?: boolean };

export function Chips({ chips }: { chips: ChipDef[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
      {chips.map((c, i) => {
        let bg = "transparent";
        let borderColor = "rgba(58,143,136,.28)";
        let color = "#41625E";
        if (c.on && c.peach) {
          bg = C.peach;
          borderColor = C.peach;
          color = "#4A3524";
        } else if (c.on) {
          bg = C.tealDeep;
          borderColor = C.tealDeep;
          color = C.cream;
        }
        return (
          <span
            key={i}
            style={{
              fontSize: 9.5,
              padding: "5px 10px",
              borderRadius: 99,
              border: `1px solid ${borderColor}`,
              background: bg,
              color,
              whiteSpace: "nowrap",
            }}
          >
            {c.label}
          </span>
        );
      })}
    </div>
  );
}

export function PCard({
  tag,
  meta,
  children,
  warm = false,
}: {
  tag: string;
  meta: string;
  children: React.ReactNode;
  warm?: boolean;
}) {
  return (
    <div
      style={{
        background: warm ? "rgba(240,165,118,.12)" : "#fff",
        border: `1px solid ${warm ? "rgba(240,165,118,.34)" : "rgba(58,143,136,.14)"}`,
        borderRadius: 13,
        padding: "11px 12px",
        marginBottom: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 5,
        }}
      >
        <b
          className="font-sans"
          style={{
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: C.muted,
          }}
        >
          {tag}
        </b>
        <span style={{ fontSize: 9, color: C.muted }}>{meta}</span>
      </div>
      <p style={{ fontSize: 11, lineHeight: 1.4, color: warm ? "#4A3524" : C.ink }}>{children}</p>
    </div>
  );
}

export function Bars({ heights }: { heights: number[] }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 56, margin: "10px 0 8px" }}>
      {heights.map((h, i) => (
        <span
          key={i}
          style={{
            flex: 1,
            height: `${h}%`,
            borderRadius: "4px 4px 2px 2px",
            background: C.teal,
            opacity: 0.75,
          }}
        />
      ))}
    </div>
  );
}

export function BtnFull({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-sans"
      style={{
        marginTop: 8,
        textAlign: "center",
        background: C.tealDeep,
        color: C.cream,
        fontSize: 11,
        fontWeight: 500,
        padding: 10,
        borderRadius: 99,
      }}
    >
      {children}
    </div>
  );
}
