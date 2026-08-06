import { useState } from "react";
import { C, Reveal, SecHead } from "./primitives";

export default function Waitlist({ onJoin }: { onJoin: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <section
      style={{
        position: "relative",
        padding: "clamp(80px,10vw,120px) clamp(22px,4vw,44px)",
        background: C.tealDeep,
        color: C.cream,
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <SecHead
          kicker="Early access"
          kickerColor="rgba(251,247,242,.75)"
          ruleColor="rgba(251,247,242,.5)"
          title="Your body is already talking."
          h2Color={C.cream}
          center
          maxWidth="22ch"
        />

        <Reveal
          index={1}
          style={{
            fontSize: 19,
            lineHeight: 1.6,
            color: "rgba(251,247,242,.86)",
            maxWidth: "46ch",
            margin: "0 auto 36px",
          }}
        >
          FeelFed helps you write it down. Join the early access list and follow the build as it
          becomes a real app.
        </Reveal>

        <Reveal index={2}>
          <button
            type="button"
            data-testid="button-early-access"
            onClick={onJoin}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className="font-sans"
            style={{
              display: "inline-block",
              fontSize: 16,
              fontWeight: 500,
              background: C.cream,
              color: C.ink,
              padding: "17px 42px",
              borderRadius: 99,
              border: "none",
              cursor: "pointer",
              transform: hover ? "translateY(-3px)" : "none",
              boxShadow: hover ? "0 16px 30px -14px rgba(0,0,0,.4)" : "none",
              transition: "transform .25s, box-shadow .25s",
            }}
          >
            Join the early access list
          </button>
        </Reveal>

        <Reveal index={3} style={{ marginTop: 20, fontSize: 13.5, color: "rgba(251,247,242,.6)" }}>
          No spam. You'll hear from me when there's something real to show.
        </Reveal>
      </div>
    </section>
  );
}
