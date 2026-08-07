import { useMemo } from "react";
import { Link } from "wouter";
import { CalendarDays } from "lucide-react";
import { Card, CardContent } from "@workspace/feelfed-ds/components/ui/card";
import { Button } from "@workspace/feelfed-ds/components/ui/button";
import { useEntries } from "@/hooks/use-store";
import type { Entry } from "@/lib/types";
import { dayLabel } from "@/lib/format";
import { TimelineEntry } from "@/components/timeline-entry";

export default function HistoryPage() {
  const entries = useEntries();

  const grouped = useMemo(() => {
    const map = new Map<string, { date: Date; items: Entry[] }>();
    // newest day first, chronological within a day
    const sorted = [...entries].sort(
      (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
    );
    for (const e of sorted) {
      const d = new Date(e.at);
      const key = d.toDateString();
      if (!map.has(key)) map.set(key, { date: d, items: [] });
      map.get(key)!.items.push(e);
    }
    return Array.from(map.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [entries]);

  return (
    <div className="px-4 pt-6">
      <div className="mb-5">
        <p className="font-mono text-sm text-muted-foreground">Your journal</p>
        <h1 className="font-serif text-3xl leading-tight mt-0.5">History</h1>
        <p className="font-mono text-sm text-muted-foreground mt-1.5">
          Everything you recorded, in the order it happened.
        </p>
      </div>

      {grouped.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
              <CalendarDays className="h-6 w-6" />
            </span>
            <p className="font-serif text-lg">Your journal starts with your first check-in.</p>
            <p className="text-sm text-muted-foreground font-mono mt-1.5">
              Anything you record on Today will appear here, grouped by day.
            </p>
            <Button asChild className="mt-4" data-testid="button-start-first">
              <Link href="/">Go to Today</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <section key={group.date.toDateString()} data-testid={`section-day-${group.date.toDateString()}`}>
              <h2 className="font-sans text-sm font-semibold text-primary mb-3 sticky top-0 bg-background/95 backdrop-blur py-1 z-[1]">
                {dayLabel(group.date)}
                <span className="ml-2 font-mono font-normal text-muted-foreground">
                  {group.items.length} {group.items.length === 1 ? "moment" : "moments"}
                </span>
              </h2>
              <ul className="pl-0.5">
                {group.items.map((entry, i) => (
                  <TimelineEntry key={entry.id} entry={entry} showLine={i < group.items.length - 1} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
