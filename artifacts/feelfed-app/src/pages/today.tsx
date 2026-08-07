import { useState } from "react";
import { Link } from "wouter";
import {
  Droplet,
  Sparkles,
  Footprints,
  UtensilsCrossed,
  ChevronRight,
  Clock3,
} from "lucide-react";
import { Card, CardContent } from "@workspace/feelfed-ds/components/ui/card";
import { Button } from "@workspace/feelfed-ds/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/feelfed-ds/components/ui/dialog";
import { toast } from "@workspace/feelfed-ds/hooks/use-toast";
import { useEntriesForDay, useNow, useOutstandingFollowUps } from "@/hooks/use-store";
import { store, nextId } from "@/lib/store";
import { HYDRATION_LABELS, type HydrationStatus } from "@/lib/types";
import { dayLabel, dueInLabel, entryTitle, timeOf } from "@/lib/format";
import { TimelineEntry } from "@/components/timeline-entry";
import { ChoiceField, ScaleField } from "@/components/form-controls";
import { FullnessRingHero } from "@/components/fullness-ring-hero";

export default function TodayPage() {
  const entries = useEntriesForDay();
  const today = new Date();
  const nowMs = useNow();
  // All outstanding follow-ups across every day, so one scheduled across
  // midnight still surfaces here.
  const followUps = useOutstandingFollowUps();

  const [hydrationOpen, setHydrationOpen] = useState(false);
  const [energyOpen, setEnergyOpen] = useState(false);
  const [hydration, setHydration] = useState<HydrationStatus>("steady");
  const [energy, setEnergy] = useState(5);

  const lastEntry = entries.length > 0
    ? entries.reduce((a, b) => (a.at > b.at ? a : b))
    : undefined;

  const now = new Date();
  const greeting =
    now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";

  function logHydration() {
    store.addEntry({ id: nextId(), kind: "hydration", at: new Date().toISOString(), status: hydration });
    setHydrationOpen(false);
    toast({ title: "Noted", description: "Hydration added to today." });
  }
  function logEnergy() {
    store.addEntry({ id: nextId(), kind: "energy", at: new Date().toISOString(), level: energy });
    setEnergyOpen(false);
    toast({ title: "Noted", description: "Energy added to today." });
  }

  return (
    <div className="px-4 pt-5">
      {/* Greeting header */}
      <div className="mb-4">
        <p className="font-mono text-sm text-muted-foreground">{dayLabel(today)}</p>
        <h1 className="font-serif text-3xl leading-tight mt-0.5">{greeting}, Sam.</h1>
        <p className="font-mono text-sm text-muted-foreground mt-1.5">
          Record whatever actually happened. A few bites counts.
        </p>
        {lastEntry && (
          <p className="font-mono text-xs text-muted-foreground mt-2" data-testid="text-last-logged">
            Last logged {timeOf(lastEntry.at)} · {entryTitle(lastEntry.kind)}
          </p>
        )}
      </div>

      {/* Fullness-ring hero */}
      <div className="mb-5">
        <FullnessRingHero />
      </div>

      {/* Primary CTA */}
      <Card className="mb-5 border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary shrink-0">
              <UtensilsCrossed className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <h2 className="font-sans font-medium">Begin a check-in</h2>
              <p className="text-sm text-muted-foreground font-mono mt-0.5">
                Before, during, or after eating — whatever fits.
              </p>
            </div>
          </div>
          <Button asChild className="w-full mt-3" data-testid="button-begin-checkin">
            <Link href="/checkin/before">Start before eating</Link>
          </Button>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Button asChild variant="outline" size="sm" data-testid="button-quick-during">
              <Link href="/checkin/during">During</Link>
            </Button>
            <Button asChild variant="outline" size="sm" data-testid="button-quick-after">
              <Link href="/checkin/after">After</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick logs */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <QuickTile icon={Droplet} label="Hydration" onClick={() => setHydrationOpen(true)} testId="button-log-hydration" />
        <QuickTile icon={Sparkles} label="Energy" onClick={() => setEnergyOpen(true)} testId="button-log-energy" />
        <QuickTile icon={Footprints} label="Movement" href="/movement/new" testId="button-log-movement" />
      </div>

      {/* Outstanding follow-ups (due + upcoming, across all days) */}
      {followUps.length > 0 && (
        <div className="mb-5 space-y-2">
          {followUps.map(({ entry: f, isDue }) => (
            <Card
              key={f.id}
              className={isDue ? "border-accent/30 bg-accent/10" : "border-border bg-secondary/5"}
            >
              <CardContent className="p-3.5 flex items-center gap-3">
                <Clock3
                  className={`h-5 w-5 shrink-0 ${isDue ? "text-accent-foreground/70" : "text-muted-foreground"}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm font-medium">
                    {isDue ? "Follow-up ready" : "Follow-up scheduled"}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {isDue
                      ? `Set for ${timeOf(f.scheduledFor)}`
                      : `Due ${dueInLabel(f.scheduledFor, nowMs)} · ${timeOf(f.scheduledFor)}`}
                  </p>
                </div>
                {isDue ? (
                  <Button asChild size="sm" data-testid={`button-followup-${f.id}`}>
                    <Link href={`/followup/${f.id}`}>Check in</Link>
                  </Button>
                ) : (
                  <Button asChild size="sm" variant="outline" data-testid={`button-followup-${f.id}`}>
                    <Link href={`/followup/${f.id}`}>Check in early</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Today's entries */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-serif text-lg">Today's moments</h2>
        <Link
          href="/history"
          className="text-sm text-primary font-sans inline-flex items-center gap-0.5"
          data-testid="link-view-history"
        >
          Timeline <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="font-serif text-lg">Nothing recorded yet</p>
            <p className="text-sm text-muted-foreground font-mono mt-1.5">
              When something happens around eating, jot it here. There's no wrong entry.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="pl-0.5">
          {entries.map((entry, i) => (
            <TimelineEntry key={entry.id} entry={entry} showLine={i < entries.length - 1} />
          ))}
        </ul>
      )}

      {/* Hydration dialog */}
      <Dialog open={hydrationOpen} onOpenChange={setHydrationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Log hydration</DialogTitle>
            <DialogDescription>How have fluids gone so far? No target to hit.</DialogDescription>
          </DialogHeader>
          <ChoiceField
            label="Right now"
            value={hydration}
            onChange={(v) => setHydration(v as HydrationStatus)}
            columns={2}
            testId="choice-hydration"
            options={(Object.keys(HYDRATION_LABELS) as HydrationStatus[]).map((k) => ({
              value: k,
              label: HYDRATION_LABELS[k],
            }))}
          />
          <DialogFooter>
            <Button onClick={logHydration} data-testid="button-save-hydration">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Energy dialog */}
      <Dialog open={energyOpen} onOpenChange={setEnergyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Record energy</DialogTitle>
            <DialogDescription>Just a snapshot of how you feel.</DialogDescription>
          </DialogHeader>
          <ScaleField
            label="Energy right now"
            value={energy}
            onChange={setEnergy}
            lowLabel="Depleted"
            highLabel="Energised"
            testId="scale-energy"
          />
          <DialogFooter>
            <Button onClick={logEnergy} data-testid="button-save-energy">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function QuickTile({
  icon: Icon,
  label,
  onClick,
  href,
  testId,
}: {
  icon: typeof Droplet;
  label: string;
  onClick?: () => void;
  href?: string;
  testId: string;
}) {
  const inner = (
    <>
      <Icon className="h-5 w-5 text-primary" />
      <span className="font-sans text-xs font-medium">{label}</span>
    </>
  );
  const cls =
    "flex flex-col items-center justify-center gap-1.5 rounded-xl border bg-card py-4 transition-colors hover:border-primary/40";
  if (href) {
    return (
      <Link href={href} className={cls} data-testid={testId}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls} data-testid={testId}>
      {inner}
    </button>
  );
}
