const BADGES = ["No calorie goals", "No streaks to break", "Your data is never sold"];

export default function TrustBadges() {
  return (
    <div
      className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg px-4 py-2.5"
      style={{
        background: "hsl(var(--accent) / 0.14)",
        border: "1px solid hsl(var(--accent) / 0.28)",
      }}
    >
      {BADGES.map((text) => (
        <div key={text} className="flex items-center gap-2 min-w-0">
          <span
            aria-hidden="true"
            className="inline-block h-[7px] w-[7px] shrink-0 rounded-full"
            style={{ background: "hsl(var(--accent))" }}
          />
          <span
            className="font-sans text-sm font-medium leading-snug"
            style={{ color: "hsl(var(--secondary))", opacity: 0.9 }}
          >
            {text}
          </span>
        </div>
      ))}
    </div>
  );
}
