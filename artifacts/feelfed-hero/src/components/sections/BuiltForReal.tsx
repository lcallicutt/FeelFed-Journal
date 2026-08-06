import { useState } from "react";
import { C, Reveal, SecHead } from "./primitives";

const CARDS = [
  {
    title: "When you rarely feel hungry",
    body: "Track what you were able to eat and how your body responded, without a target sitting there unmet.",
  },
  {
    title: "When you get full in three bites",
    body: "Record portions, how quickly fullness arrived, discomfort, and how long it took to pass.",
  },
  {
    title: "When your energy makes no sense",
    body: "Log energy on its own, alongside hydration, movement, sleep, and meals, and see them side by side.",
  },
  {
    title: "When you need to explain the whole picture",
    body: "Walk into an appointment with an organized record instead of trying to remember three weeks on the spot.",
  },
];

function RCard({ title, body, index }: { title: string; body: string; index: number }) {
  const [hover, setHover] = useState(false);
  return (
    <Reveal
      index={index}
      style={{
        border: `1px solid ${hover ? "rgba(240,165,118,.4)" : "rgba(220,233,231,.16)"}`,
        borderRadius: 20,
        padding: "30px 30px 28px",
        background: hover ? "rgba(255,255,255,.07)" : "rgba(255,255,255,.035)",
        transform: hover ? "translateY(-3px)" : "none",
        transition:
          "background .4s, border-color .4s, transform .4s, opacity .8s cubic-bezier(.4,0,.2,1)",
      }}
    >
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <h4
          className="font-serif"
          style={{
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: 23,
            color: C.cream,
            marginBottom: 10,
            lineHeight: 1.2,
          }}
        >
          {title}
        </h4>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "#A9C4C0" }}>{body}</p>
      </div>
    </Reveal>
  );
}

export default function BuiltForReal() {
  return (
    <section
      style={{
        position: "relative",
        padding: "clamp(80px,10vw,120px) clamp(22px,4vw,44px)",
        background: C.ink,
        color: "#DCE9E7",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <SecHead
          kicker="Built for real experiences"
          kickerColor={C.peach}
          ruleColor={C.peach}
          title="For the days that"
          em="don't fit"
          titleTail="the app you already tried."
          h2Color={C.cream}
          emColor={C.peach}
        />

        <div
          className="ff-cards"
        >
          {CARDS.map((c, i) => (
            <RCard key={c.title} title={c.title} body={c.body} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
