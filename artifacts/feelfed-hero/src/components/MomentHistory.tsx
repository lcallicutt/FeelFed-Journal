import { useGetMoments, type MomentRecord } from "@workspace/api-client-react";

interface MomentHistoryProps {
  deviceId: string;
}

function relativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

function MomentRow({ moment }: { moment: MomentRecord }) {
  return (
    <div
      className="flex flex-col gap-1.5 py-3 border-b last:border-b-0"
      style={{ borderColor: "hsl(var(--border))" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          <span
            className="font-sans text-xs px-2 py-0.5 rounded-full"
            style={{
              background: "hsl(var(--muted))",
              color: "hsl(var(--muted-foreground))",
            }}
          >
            Fullness · {moment.fullness}
          </span>
          <span
            className="font-sans text-xs px-2 py-0.5 rounded-full"
            style={{
              background: "hsl(var(--muted))",
              color: "hsl(var(--muted-foreground))",
            }}
          >
            Energy · {moment.energy}
          </span>
          <span
            className="font-sans text-xs px-2 py-0.5 rounded-full"
            style={{
              background: "hsl(var(--muted))",
              color: "hsl(var(--muted-foreground))",
            }}
          >
            Hydration · {moment.hydration}
          </span>
        </div>
        <span
          className="font-sans text-xs shrink-0 ml-2"
          style={{ color: "hsl(var(--muted-foreground))", opacity: 0.6 }}
        >
          {relativeTime(moment.createdAt)}
        </span>
      </div>
      {moment.reflection && (
        <p
          className="font-mono text-xs leading-relaxed"
          style={{ color: "hsl(var(--foreground))", opacity: 0.7 }}
        >
          {moment.reflection}
        </p>
      )}
    </div>
  );
}

export default function MomentHistory({ deviceId }: MomentHistoryProps) {
  const { data, isLoading, isError } = useGetMoments({ deviceId, limit: 20 });

  const moments = data?.moments ?? [];

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-2 px-1">
        <span
          className="font-sans text-xs tracking-widest uppercase"
          style={{ color: "hsl(var(--muted-foreground))", opacity: 0.7 }}
        >
          Recent moments
        </span>
        {moments.length > 0 && (
          <span
            className="font-sans text-xs"
            style={{ color: "hsl(var(--muted-foreground))", opacity: 0.5 }}
          >
            {moments.length} saved
          </span>
        )}
      </div>

      <div
        className="rounded-lg border overflow-hidden"
        style={{
          background: "hsl(var(--background))",
          borderColor: "hsl(var(--border))",
        }}
      >
        {isLoading && (
          <div className="px-4 py-6 text-center">
            <p
              className="font-sans text-xs"
              style={{ color: "hsl(var(--muted-foreground))", opacity: 0.5 }}
            >
              Loading…
            </p>
          </div>
        )}
        {isError && (
          <div className="px-4 py-6 text-center">
            <p
              className="font-sans text-xs"
              style={{ color: "hsl(var(--muted-foreground))", opacity: 0.5 }}
            >
              Could not load history.
            </p>
          </div>
        )}
        {!isLoading && !isError && moments.length === 0 && (
          <div className="px-4 py-6 text-center">
            <p
              className="font-sans text-xs"
              style={{ color: "hsl(var(--muted-foreground))", opacity: 0.5 }}
            >
              No moments yet — save one above.
            </p>
          </div>
        )}
        {moments.length > 0 && (
          <div className="px-4 max-h-80 overflow-y-auto">
            {moments.map((m: MomentRecord) => (
              <MomentRow key={m.id} moment={m} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
