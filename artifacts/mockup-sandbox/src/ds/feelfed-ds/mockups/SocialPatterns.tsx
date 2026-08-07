// Social card: "Patterns" — 1:1 square, edge-to-edge, Instagram-ready
export function SocialPatterns() {
  // Mini sparkline data — 7 days
  const fullness = [4, 6, 5, 7, 6, 8, 7];
  const energy  = [5, 4, 7, 6, 8, 7, 9];
  const hydration = [3, 5, 4, 6, 5, 7, 6];

  const W = 260, H = 100;
  const maxVal = 10;
  function pts(data: number[]) {
    return data
      .map((v, i) => {
        const x = (i / (data.length - 1)) * W;
        const y = H - (v / maxVal) * H;
        return `${x},${y}`;
      })
      .join(" ");
  }

  const textures = ["Crunchy", "Warm", "Soft", "Fresh", "Rich"];
  const moods    = ["Content", "Tired", "Anxious", "Calm", "Energized"];

  return (
    <div
      style={{
        width: "100vw",
        height: "100vw",
        maxHeight: "100vh",
        aspectRatio: "1 / 1",
        background: "#F5EEE4",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ padding: "28px 36px 14px" }}>
        <div style={{ color: "#8FA8A5", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}>FeelFed · Patterns</div>
        <div style={{ color: "#1F4E49", fontSize: 26, fontFamily: "Fraunces, serif", fontWeight: 600, marginTop: 4, lineHeight: 1.1 }}>
          14 days of<br />honest data.
        </div>
        <div style={{ color: "#6B8E8A", fontSize: 11, fontFamily: "Lato, sans-serif", marginTop: 5 }}>
          No scores. No streaks. Just what's here.
        </div>
      </div>

      {/* Chart */}
      <div style={{
        margin: "0 28px",
        background: "white",
        borderRadius: 16,
        padding: "16px 20px 12px",
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
      }}>
        <div style={{ fontSize: 10, color: "#8FA8A5", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Fullness · Energy · Hydration</div>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
          {/* Grid lines */}
          {[0, 0.5, 1].map((f) => (
            <line key={f} x1={0} y1={f * H} x2={W} y2={f * H} stroke="#F0E8DF" strokeWidth="1" />
          ))}
          {/* Hydration dashed */}
          <polyline points={pts(hydration)} fill="none" stroke="#87C4C0" strokeWidth="2" strokeDasharray="4 3" strokeLinecap="round" strokeLinejoin="round" />
          {/* Energy */}
          <polyline points={pts(energy)} fill="none" stroke="#E8A86F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Fullness */}
          <polyline points={pts(fullness)} fill="none" stroke="#3A8F88" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {/* Legend */}
        <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
          {[
            { color: "#3A8F88", label: "Fullness" },
            { color: "#E8A86F", label: "Energy" },
            { color: "#87C4C0", label: "Hydration", dashed: true },
          ].map(({ color, label, dashed }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{
                width: 20, height: 2,
                background: dashed ? "none" : color,
                borderTop: dashed ? `2px dashed ${color}` : undefined,
              }} />
              <span style={{ fontSize: 9, color: "#8FA8A5", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Textures & moods */}
      <div style={{ flex: 1, padding: "14px 28px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <div style={{ fontSize: 9, color: "#8FA8A5", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 6 }}>Textures recorded</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {textures.map((t) => (
              <div key={t} style={{
                background: "white",
                border: "1.5px solid #DDD4C5",
                color: "#1F4E49",
                fontSize: 10,
                fontWeight: 500,
                padding: "4px 11px",
                borderRadius: 20,
              }}>{t}</div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: "#8FA8A5", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 6 }}>Moods noted</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {moods.map((m) => (
              <div key={m} style={{
                background: "#EBF5F4",
                border: "1.5px solid #87C4C0",
                color: "#3A8F88",
                fontSize: 10,
                fontWeight: 500,
                padding: "4px 11px",
                borderRadius: 20,
              }}>{m}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: "14px 36px 22px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div style={{ color: "#8FA8A5", fontSize: 10, fontFamily: "Lato, sans-serif" }}>feelfed.app</div>
        <div style={{
          background: "#3A8F88",
          color: "white",
          fontSize: 9,
          fontFamily: "Poppins, sans-serif",
          fontWeight: 700,
          padding: "6px 14px",
          borderRadius: 20,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}>See your patterns</div>
      </div>
    </div>
  );
}
