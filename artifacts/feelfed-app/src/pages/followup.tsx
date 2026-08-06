import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { Clock3 } from "lucide-react";
import { toast } from "@workspace/feelfed-ds/hooks/use-toast";
import { Card, CardContent } from "@workspace/feelfed-ds/components/ui/card";
import { CheckinLayout } from "@/components/checkin-layout";
import { ChipMultiSelect, ScaleField } from "@/components/form-controls";
import { Reassurance } from "@/components/reassurance";
import { ScreenHeader } from "@/components/screen-header";
import { Button } from "@workspace/feelfed-ds/components/ui/button";
import { useEntries } from "@/hooks/use-store";
import { store } from "@/lib/store";
import { SENSATION_OPTIONS, type FollowUpEntry } from "@/lib/types";
import { timeOf } from "@/lib/format";

export default function FollowUpPage() {
  const params = useParams();
  const [, navigate] = useLocation();
  const entries = useEntries();
  const followUp = entries.find((e) => e.id === params.id && e.kind === "followup") as
    | FollowUpEntry
    | undefined;

  const [fullness, setFullness] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [sensations, setSensations] = useState<string[]>([]);

  function toggle(s: string) {
    setSensations((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  if (!followUp) {
    return (
      <div className="flex flex-col min-h-[100dvh]">
        <ScreenHeader title="Follow-up" backHref="/" />
        <div className="flex-1 px-4 py-10">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="font-serif text-lg">This follow-up isn't here</p>
              <p className="text-sm text-muted-foreground font-mono mt-1.5">
                It may have been completed or removed.
              </p>
              <Button className="mt-4" onClick={() => navigate("/")} data-testid="button-back-today">
                Back to today
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  function save() {
    store.updateEntry(followUp!.id, {
      completed: true,
      fullness,
      energy,
      sensations,
      at: new Date().toISOString(),
    } as Partial<FollowUpEntry>);
    toast({ title: "Follow-up recorded", description: "Noticing how things settle is useful." });
    navigate("/");
  }

  return (
    <CheckinLayout
      title="Follow-up check-in"
      subtitle={`Scheduled for ${timeOf(followUp.scheduledFor)}`}
      backHref="/"
      onSave={save}
      saveLabel="Save follow-up"
    >
      <div className="flex items-center gap-2.5 rounded-xl bg-primary/5 px-3.5 py-3 border border-primary/15">
        <Clock3 className="h-4 w-4 text-primary shrink-0" />
        <p className="text-sm text-muted-foreground font-mono">
          Checking in a little while after eating — how have things settled?
        </p>
      </div>

      <Reassurance>
        Whatever you notice is fine, including "no change" or "not sure."
      </Reassurance>

      <ScaleField label="Fullness now" value={fullness} onChange={setFullness} lowLabel="Empty" highLabel="Very full" testId="scale-fullness" />
      <ScaleField label="Energy now" value={energy} onChange={setEnergy} lowLabel="Depleted" highLabel="Energised" testId="scale-energy" />

      <ChipMultiSelect
        label="Body sensations"
        hint="Optional"
        options={SENSATION_OPTIONS}
        selected={sensations}
        onToggle={toggle}
        testId="chips-sensations"
      />
    </CheckinLayout>
  );
}
