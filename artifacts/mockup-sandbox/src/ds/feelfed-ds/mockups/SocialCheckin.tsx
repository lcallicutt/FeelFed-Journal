// Social card: "Check-in" — 1:1 square, edge-to-edge, Instagram-ready
export function SocialCheckin() {
  const steps = [
    {
      label: "Before",
      color: "#3A8F88",
      bg: "#EBF5F4",
      question: "How hungry are you right now?",
      answer: "Pretty hungry",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 11l19-9-9 19-2-8-8-2z" />
        </svg>
      ),
    },
    {
      label: "During",
      color: "#E8A86F",
      bg: "#FDF3EA",
      question: "How much did you eat?",
      answer: "About half",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
        </svg>
      ),
    },
    {
      label: "After",
      color: "#1F4E49",
      bg: "#E6EFEE",
      question: "How do you feel now?",
      answer: "Satisfied, a little full",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
    },
  ];

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
      <div style={{ padding: "30px 36px 20px", background: "#F5EEE4" }}>
        <div style={{ color: "#8FA8A5", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}>FeelFed · Check-in</div>
        <div style={{ color: "#1F4E49", fontSize: 26, fontFamily: "Fraunces, serif", fontWeight: 600, marginTop: 4, lineHeight: 1.1 }}>
          Three gentle<br />check-ins.
        </div>
        <div style={{ color: "#6B8E8A", fontSize: 12, fontFamily: "Lato, sans-serif", marginTop: 6, lineHeight: 1.5 }}>
          Before, during, and after — no pressure, just presence.
        </div>
      </div>

      {/* Steps */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, padding: "0 28px", justifyContent: "center" }}>
        {steps.map((step, i) => (
          <div
            key={step.label}
            style={{
              background: step.bg,
              borderRadius: 16,
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: step.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", flexShrink: 0,
            }}>
              {step.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: step.color, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {step.label}
              </div>
              <div style={{ fontSize: 11, color: "#4A6B68", fontFamily: "Lato, sans-serif", marginTop: 1 }}>{step.question}</div>
            </div>
            <div style={{
              background: "white",
              color: "#1F4E49",
              fontSize: 11,
              fontWeight: 600,
              padding: "6px 12px",
              borderRadius: 20,
              fontFamily: "Poppins, sans-serif",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              whiteSpace: "nowrap",
            }}>
              {step.answer}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        padding: "16px 36px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: "1px solid rgba(31,78,73,0.1)",
      }}>
        <div style={{ color: "#8FA8A5", fontSize: 10, fontFamily: "Lato, sans-serif", letterSpacing: "0.06em" }}>
          Available on iOS & Android
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["#3A8F88", "#E8A86F", "#1F4E49"].map((c, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
          ))}
        </div>
      </div>
    </div>
  );
}
