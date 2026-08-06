import { C, Reveal } from "./primitives";

const TABS: Array<{ name: string; caption: string }> = [
  { name: "Today", caption: "Check in" },
  { name: "History", caption: "Look back" },
  { name: "Trends", caption: "See patterns" },
  { name: "You", caption: "Your account" },
];

export default function AppNav() {
  return (
    <section style={{ position: "relative", padding: "clamp(56px,7vw,84px) clamp(22px,4vw,44px)" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
        <Reveal
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
            marginBottom: 22,
            justifyContent: "center",
          }}
        >
          <span style={{ width: 26, height: 1, background: C.teal, flex: "none" }} />
          Four places, nothing more
        </Reveal>

        {/* Tab strip */}
        <Reveal index={1}>
          <div
            role="list"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 8,
              background: "#fff",
              border: "1px solid rgba(58,143,136,.16)",
              borderRadius: 18,
              padding: 8,
              maxWidth: 520,
              margin: "0 auto",
              boxShadow: "0 18px 40px -28px rgba(31,78,73,.5)",
            }}
          >
            {TABS.map((tab, i) => {
              const active = i === 0;
              return (
                <div
                  key={tab.name}
                  role="listitem"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 7,
                    padding: "14px 6px",
                    borderRadius: 12,
                    background: active ? "rgba(58,143,136,.10)" : "transparent",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      background: active ? C.tealDeep : C.muted,
                      opacity: active ? 0.7 : 0.32,
                    }}
                  />
                  <span
                    className="font-sans"
                    style={{
                      fontSize: 12.5,
                      fontWeight: 500,
                      color: active ? C.tealDeep : C.ink,
                    }}
                  >
                    {tab.name}
                  </span>
                  <span
                    className="font-sans"
                    style={{
                      fontSize: 9.5,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      color: C.muted,
                    }}
                  >
                    {tab.caption}
                  </span>
                </div>
              );
            })}
          </div>
        </Reveal>

        <Reveal
          index={2}
          style={{
            marginTop: 24,
            fontSize: 16,
            lineHeight: 1.6,
            color: C.subhead,
            maxWidth: "48ch",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Check in today. Look back when you need context. Review patterns without being scored.
        </Reveal>
      </div>
    </section>
  );
}
