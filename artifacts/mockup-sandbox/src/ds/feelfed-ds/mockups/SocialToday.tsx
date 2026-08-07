// Social card: "Today" — 1:1 square, edge-to-edge, Instagram-ready
export function SocialToday() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vw",
        maxWidth: "100vh",
        maxHeight: "100vw",
        aspectRatio: "1 / 1",
        background: "#F5EEE4",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {/* Top teal band */}
      <div
        style={{
          background: "#3A8F88",
          padding: "28px 36px 22px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>FeelFed</div>
          <div style={{ color: "#fff", fontSize: 22, fontFamily: "Fraunces, serif", fontWeight: 600, marginTop: 2, lineHeight: 1.15 }}>Good morning, Sam.</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "Poppins, sans-serif" }}>Today</div>
          <div style={{ color: "rgba(255,255,255,0.9)", fontSize: 12, fontFamily: "Lato, sans-serif", marginTop: 2 }}>Saturday, Aug 7</div>
        </div>
      </div>

      {/* Ring visualization */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <svg width="260" height="260" viewBox="0 0 260 260">
          {/* Outer ring track — hydration */}
          <circle cx="130" cy="130" r="118" fill="none" stroke="#E5DDD2" strokeWidth="18" />
          <circle cx="130" cy="130" r="118" fill="none" stroke="#87C4C0" strokeWidth="18"
            strokeDasharray="518" strokeDashoffset="155"
            strokeLinecap="round" transform="rotate(-90 130 130)" />
          {/* Mid ring track — energy */}
          <circle cx="130" cy="130" r="92" fill="none" stroke="#E5DDD2" strokeWidth="18" />
          <circle cx="130" cy="130" r="92" fill="none" stroke="#3A8F88" strokeWidth="18"
            strokeDasharray="404" strokeDashoffset="101"
            strokeLinecap="round" transform="rotate(-90 130 130)" />
          {/* Inner ring track — fullness */}
          <circle cx="130" cy="130" r="66" fill="none" stroke="#E5DDD2" strokeWidth="18" />
          <circle cx="130" cy="130" r="66" fill="none" stroke="#E8A86F" strokeWidth="18"
            strokeDasharray="290" strokeDashoffset="87"
            strokeLinecap="round" transform="rotate(-90 130 130)" />
          {/* Center */}
          <circle cx="130" cy="130" r="40" fill="white" />
          <text x="130" y="126" textAnchor="middle" fill="#1F4E49" fontSize="11" fontFamily="Poppins, sans-serif" fontWeight="600">Feeling</text>
          <text x="130" y="142" textAnchor="middle" fill="#3A8F88" fontSize="16" fontFamily="Fraunces, serif" fontWeight="600">good</text>
        </svg>

        {/* Ring labels */}
        <div style={{ position: "absolute", right: 36, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { color: "#87C4C0", label: "Hydration", value: "Steady" },
            { color: "#3A8F88", label: "Energy", value: "7 / 10" },
            { color: "#E8A86F", label: "Fullness", value: "Satisfied" },
          ].map(({ color, label, value }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 9, color: "#8FA8A5", fontFamily: "Poppins, sans-serif", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
                <div style={{ fontSize: 11, color: "#1F4E49", fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom strip */}
      <div
        style={{
          background: "#1F4E49",
          padding: "18px 36px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, fontFamily: "Lato, sans-serif", maxWidth: 220, lineHeight: 1.5 }}>
          Record whatever actually happened.<br />A few bites counts.
        </div>
        <div style={{
          background: "#3A8F88",
          color: "#F5EEE4",
          fontSize: 10,
          fontFamily: "Poppins, sans-serif",
          fontWeight: 600,
          padding: "8px 16px",
          borderRadius: 20,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}>
          Log a moment
        </div>
      </div>
    </div>
  );
}
