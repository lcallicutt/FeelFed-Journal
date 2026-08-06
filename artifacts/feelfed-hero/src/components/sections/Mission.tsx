import { C, Reveal } from "./primitives";

export default function Mission() {
  return (
    <section
      style={{
        position: "relative",
        padding: "clamp(80px,10vw,120px) clamp(22px,4vw,44px)",
        background: C.paper,
      }}
    >
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
            marginBottom: 20,
            justifyContent: "center",
          }}
        >
          <span style={{ width: 26, height: 1, background: C.teal, flex: "none" }} />
          Why FeelFed exists
        </Reveal>

        <Reveal index={1}>
          <h2
            className="font-serif"
            style={{
              fontWeight: 300,
              fontSize: "clamp(30px,3.8vw,46px)",
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              color: C.ink,
              margin: 0,
            }}
          >
            Built because{" "}
            <em style={{ fontStyle: "italic", fontWeight: 500, color: C.peach }}>
              "everything looks normal"
            </em>{" "}
            does not always tell the whole story.
          </h2>
        </Reveal>

        <Reveal
          index={2}
          style={{
            marginTop: 22,
            fontSize: 17,
            lineHeight: 1.65,
            color: C.subhead,
            maxWidth: "52ch",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          FeelFed began with a simple need: a better way to document low appetite, early fullness,
          energy changes, movement, hydration, and the everyday experiences that are difficult to
          remember or explain later.
        </Reveal>
      </div>
    </section>
  );
}
