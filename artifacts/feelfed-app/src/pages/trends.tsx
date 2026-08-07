import { useMemo } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/feelfed-ds/components/ui/card";
import { Badge } from "@workspace/feelfed-ds/components/ui/badge";
import { useEntries } from "@/hooks/use-store";
import { AMOUNT_LABELS, TEXTURE_LABELS, type Entry, type HydrationStatus } from "@/lib/types";

// Categorical hydration mapped to a simple 0-10-ish scale purely so it can be
// drawn on the same descriptive axis. Not a target or a score.
const HYDRATION_SCALE: Record<HydrationStatus, number> = {
  "not-yet": 1,
  sips: 4,
  steady: 7,
  well: 10,
};

function within14Days(iso: string): boolean {
  const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
  return new Date(iso).getTime() >= cutoff;
}

export default function TrendsPage() {
  const entries = useEntries();

  const recent = useMemo(() => entries.filter((e) => within14Days(e.at)), [entries]);

  const stats = useMemo(() => computeStats(recent), [recent]);

  return (
    <div className="px-4 pt-6">
      <div className="mb-5">
        <p className="font-mono text-sm text-muted-foreground">Last 14 days</p>
        <h1 className="font-serif text-3xl leading-tight mt-0.5">Patterns</h1>
        <p className="font-mono text-sm text-muted-foreground mt-1.5">
          A plain count of what you recorded. No scores, no goals — just what's here.
        </p>
      </div>

      {recent.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="font-serif text-lg">Nothing to describe yet</p>
            <p className="text-sm text-muted-foreground font-mono mt-1.5">
              Patterns appear here as you record moments over the next couple of weeks.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Recorded counts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-serif text-lg">What you recorded</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <CountTile label="Eating reflections" value={stats.afterCount} />
              <CountTile label="Before check-ins" value={stats.beforeCount} />
              <CountTile label="Hydration notes" value={stats.hydrationCount} />
              <CountTile label="Movement notes" value={stats.movementCount} />
            </CardContent>
          </Card>

          {/* Fullness & energy trend chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-serif text-lg">Fullness, energy & hydration recorded</CardTitle>
              <p className="text-xs text-muted-foreground font-mono">
                Daily averages of what you logged. Hydration is placed on the same scale for
                comparison, not scored. Gaps are days without entries.
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-52 w-full -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.daily} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      domain={[0, 10]}
                      width={22}
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="fullness"
                      name="Fullness"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="energy"
                      name="Energy"
                      stroke="hsl(var(--accent))"
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="hydration"
                      name="Hydration"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      strokeDasharray="4 3"
                      dot={false}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-4 mt-2 justify-center flex-wrap">
                <LegendDot color="hsl(var(--primary))" label="Fullness" />
                <LegendDot color="hsl(var(--accent))" label="Energy" />
                <LegendDot color="hsl(var(--chart-1))" label="Hydration" />
              </div>
            </CardContent>
          </Card>

          {/* Amounts recorded */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-serif text-lg">Amounts you recorded</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {stats.amounts.map((a) => (
                <BarRow key={a.key} label={AMOUNT_LABELS[a.key as keyof typeof AMOUNT_LABELS]} count={a.count} max={stats.amountMax} />
              ))}
              {stats.amounts.length === 0 && (
                <p className="text-sm text-muted-foreground font-mono">No amounts recorded yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Textures */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-serif text-lg">Food textures recorded</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {stats.textures.map((t) => (
                <Badge key={t.key} variant="secondary" className="font-sans" data-testid={`badge-texture-${t.key}`}>
                  {TEXTURE_LABELS[t.key as keyof typeof TEXTURE_LABELS]} · {t.count}
                </Badge>
              ))}
              {stats.textures.length === 0 && (
                <p className="text-sm text-muted-foreground font-mono">No textures recorded yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Moods */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-serif text-lg">Moods you noted</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {stats.moods.map((m) => (
                <Badge key={m.key} variant="outline" className="font-sans" data-testid={`badge-mood-${m.key}`}>
                  {m.key} · {m.count}
                </Badge>
              ))}
              {stats.moods.length === 0 && (
                <p className="text-sm text-muted-foreground font-mono">No moods noted yet.</p>
              )}
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground font-mono text-center px-4 pb-2">
            These are descriptions of your own entries, not assessments. FeelFed doesn't judge what
            you record.
          </p>
        </div>
      )}
    </div>
  );
}

function CountTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-secondary/5 px-3 py-3">
      <p className="font-serif text-2xl leading-none text-primary tabular-nums" data-testid={`count-${label}`}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground font-mono mt-1">{label}</p>
    </div>
  );
}

function BarRow({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="font-sans text-sm">{label}</span>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">{count}</span>
      </div>
      <div className="h-2 rounded-full bg-primary/10 overflow-hidden">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

// ---- descriptive stats (counts only, no scoring) ----
function computeStats(entries: Entry[]) {
  const afterCount = entries.filter((e) => e.kind === "after").length;
  const beforeCount = entries.filter((e) => e.kind === "before").length;
  const hydrationCount = entries.filter((e) => e.kind === "hydration").length;
  const movementCount = entries.filter((e) => e.kind === "movement").length;

  // daily averages for fullness (after) & energy (energy + before)
  const dayMap = new Map<
    string,
    {
      date: Date;
      fullSum: number;
      fullN: number;
      enSum: number;
      enN: number;
      hydSum: number;
      hydN: number;
    }
  >();
  for (const e of entries) {
    const d = new Date(e.at);
    const key = d.toDateString();
    if (!dayMap.has(key))
      dayMap.set(key, { date: d, fullSum: 0, fullN: 0, enSum: 0, enN: 0, hydSum: 0, hydN: 0 });
    const rec = dayMap.get(key)!;
    if (e.kind === "after") {
      rec.fullSum += e.fullness;
      rec.fullN += 1;
    }
    if (e.kind === "energy") {
      rec.enSum += e.level;
      rec.enN += 1;
    }
    if (e.kind === "before") {
      rec.enSum += e.energy;
      rec.enN += 1;
      rec.hydSum += HYDRATION_SCALE[e.hydration];
      rec.hydN += 1;
    }
    if (e.kind === "hydration") {
      rec.hydSum += HYDRATION_SCALE[e.status];
      rec.hydN += 1;
    }
    if (e.kind === "moment") {
      rec.fullSum += e.fullness;
      rec.fullN += 1;
      rec.enSum += e.energy;
      rec.enN += 1;
      rec.hydSum += e.hydration;
      rec.hydN += 1;
    }
  }
  const daily = Array.from(dayMap.values())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((r) => ({
      label: r.date.toLocaleDateString(undefined, { month: "numeric", day: "numeric" }),
      fullness: r.fullN ? Math.round((r.fullSum / r.fullN) * 10) / 10 : null,
      energy: r.enN ? Math.round((r.enSum / r.enN) * 10) / 10 : null,
      hydration: r.hydN ? Math.round((r.hydSum / r.hydN) * 10) / 10 : null,
    }));

  // amounts
  const amountCounts = new Map<string, number>();
  const textureCounts = new Map<string, number>();
  const moodCounts = new Map<string, number>();
  for (const e of entries) {
    if (e.kind === "after") {
      amountCounts.set(e.amount, (amountCounts.get(e.amount) ?? 0) + 1);
      textureCounts.set(e.texture, (textureCounts.get(e.texture) ?? 0) + 1);
    }
    if (e.kind === "before") {
      moodCounts.set(e.mood, (moodCounts.get(e.mood) ?? 0) + 1);
    }
  }
  const amounts = Array.from(amountCounts.entries()).map(([key, count]) => ({ key, count }));
  const amountMax = amounts.reduce((m, a) => Math.max(m, a.count), 0);
  const textures = Array.from(textureCounts.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
  const moods = Array.from(moodCounts.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);

  return {
    afterCount,
    beforeCount,
    hydrationCount,
    movementCount,
    daily,
    amounts,
    amountMax,
    textures,
    moods,
  };
}
