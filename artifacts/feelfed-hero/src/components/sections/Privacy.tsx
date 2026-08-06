import { C, Reveal, SecHead } from "./primitives";

const ITEMS = [
  {
    title: "Only you see your records",
    body: "No public profile, ever, by default. Nothing is shared with a doctor unless you send it.",
  },
  {
    title: "Your wellness entries are not advertising data",
    body: "FeelFed will not sell your food, symptom, weight, or activity entries for targeted advertising.",
  },
  {
    title: "Export it or delete it",
    body: "Take your full history with you, correct it, or remove your account entirely.",
  },
  {
    title: "Plain language, no scoring",
    body: "No grades on your meals, no shame mechanics, no conclusions drawn about your body.",
  },
];

export default function Privacy() {
  return (
    <section
      style={{
        position: "relative",
        padding: "clamp(80px,10vw,120px) clamp(22px,4vw,44px)",
        background: "linear-gradient(170deg,#EFF5F3,#F6F1EA)",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <SecHead
          kicker="Privacy"
          title="Your experiences"
          em="belong to you."
          subhead="What you record in FeelFed is personal. Privacy is being considered from the first line of code."
        />

        <div className="ff-plist">
          {ITEMS.map((item, i) => (
            <Reveal
              key={item.title}
              index={i}
              style={{
                display: "flex",
                gap: 12,
                padding: "15px 0",
                borderBottom: "1px solid rgba(58,143,136,.14)",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: C.teal,
                  marginTop: 8,
                  flex: "none",
                }}
              />
              <div>
                <b
                  className="font-sans"
                  style={{ display: "block", fontSize: 14.5, fontWeight: 500, marginBottom: 3, color: C.ink }}
                >
                  {item.title}
                </b>
                <p style={{ fontSize: 14, lineHeight: 1.5, color: C.body }}>{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal
          style={{
            marginTop: 34,
            fontSize: 13,
            fontStyle: "italic",
            color: C.muted,
            maxWidth: "60ch",
          }}
        >
          FeelFed is a personal wellness journal. It does not diagnose, treat, or prevent any
          condition, and it does not determine why you feel the way you do. It records what you
          tell it.
        </Reveal>
      </div>
    </section>
  );
}
