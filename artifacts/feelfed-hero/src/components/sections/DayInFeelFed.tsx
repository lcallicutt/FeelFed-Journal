import { useState } from "react";
import { C, Reveal, SecHead } from "./primitives";
import { useReveal, revealStyle } from "./useReveal";

type Variant = "teal" | "peach" | "water";

const MOMENTS: Array<{ time: string; title: string; body: string; variant: Variant }> = [
  {
    time: "9:00 AM",
    title: "No appetite, water only",
    body: "Energy logged at 3. Nothing eaten yet. Recorded, not flagged.",
    variant: "teal",
  },
  {
    time: "12:30 PM",
    title: "Small meal, a few bites",
    body: "Fullness climbed from 2 to 8 within ten minutes. Bloating noted.",
    variant: "peach",
  },
  {
    time: "1:15 PM",
    title: "Follow-up check-in",
    body: "Still uncomfortable. Energy unchanged. One tap, no typing required.",
    variant: "water",
  },
  {
    time: "3:15 PM",
    title: "Short walk, ten minutes",
    body: "Energy after: 5. Marked as completed, shortened, or skipped, all equally valid.",
    variant: "teal",
  },
  {
    time: "6:00 PM",
    title: "Smoothie, finished it",
    body: "Comfortable fullness. Logged as blended. Hydration up for the day.",
    variant: "water",
  },
];

function dotColor(v: Variant) {
  return v === "peach" ? C.peach : v === "water" ? C.water : C.teal;
}

function Moment({
  time,
  title,
  body,
  variant,
  index,
}: {
  time: string;
  title: string;
  body: string;
  variant: Variant;
  index: number;
}) {
  const { ref, shown } = useReveal();
  const [hover, setHover] = useState(false);
  const active = shown || hover;
  return (
    <div
      ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...revealStyle(shown, index), position: "relative", padding: "22px 0" }}
    >
      <span
        aria-hidden
        style={{
          content: '""',
          position: "absolute",
          left: -31,
          top: 28,
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: C.paper,
          border: `2.5px solid ${dotColor(variant)}`,
          transform: active ? "scale(1.25)" : "none",
          transition: "transform .5s, border-color .5s",
        }}
      />
      <time
        className="font-sans"
        style={{
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: "0.09em",
          color: C.muted,
          display: "block",
          marginBottom: 6,
        }}
      >
        {time}
      </time>
      <h5 className="font-serif" style={{ fontWeight: 500, fontSize: 21, marginBottom: 5, color: C.ink }}>
        {title}
      </h5>
      <p style={{ fontSize: 15, lineHeight: 1.55, color: C.subhead, maxWidth: "40ch" }}>{body}</p>
    </div>
  );
}

export default function DayInFeelFed() {
  return (
    <section style={{ position: "relative", padding: "clamp(80px,10vw,120px) clamp(22px,4vw,44px)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <SecHead
          kicker="A day in FeelFed"
          title="Ordinary days are what make a"
          em="pattern readable."
        />

        <div className="ff-tlwrap">
          {/* Timeline */}
          <div style={{ position: "relative", paddingLeft: 34 }}>
            <span
              aria-hidden
              style={{
                position: "absolute",
                left: 8,
                top: 10,
                bottom: 10,
                width: 2,
                background:
                  "linear-gradient(180deg, rgba(58,143,136,.4), rgba(240,165,118,.4), rgba(79,169,198,.4))",
              }}
            />
            {MOMENTS.map((m, i) => (
              <Moment key={m.time} {...m} index={i} />
            ))}
          </div>

          {/* Sticky aside */}
          <Reveal
            className="ff-aside"
            style={{
              background: "#fff",
              border: "1px solid rgba(58,143,136,.16)",
              borderRadius: 20,
              padding: "26px 24px",
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
                color: C.tealDeep,
                marginBottom: 14,
              }}
            >
              <span style={{ width: 26, height: 1, background: C.teal, flex: "none" }} />
              At the end of the day
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: C.subhead }}>
              FeelFed adds up what you recorded and nothing else. Five entries, three textures, two
              symptoms, one walk.
            </p>
            <p
              style={{
                marginTop: 16,
                paddingTop: 14,
                borderTop: "1px solid rgba(58,143,136,.16)",
                fontSize: 12.5,
                fontStyle: "italic",
                color: C.muted,
              }}
            >
              No score. No streak. No note telling you what any of it means.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
