import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "@workspace/feelfed-ds/hooks/use-toast";
import { Label } from "@workspace/feelfed-ds/components/ui/label";
import { Textarea } from "@workspace/feelfed-ds/components/ui/textarea";
import { CheckinLayout } from "@/components/checkin-layout";
import { ChoiceField } from "@/components/form-controls";
import { Reassurance } from "@/components/reassurance";
import { store, nextId } from "@/lib/store";

const ACTIVITIES = [
  "Gentle walk",
  "Stretching",
  "Slow yoga",
  "Housework",
  "Rest day",
  "Something else",
];
const DURATIONS = ["5 min", "10 min", "15 min", "20 min", "30 min", "Longer"];

export default function MovementNewPage() {
  const [, navigate] = useLocation();
  const [activity, setActivity] = useState<string>("Gentle walk");
  const [duration, setDuration] = useState<string>("10 min");
  const [note, setNote] = useState("");
  const isSomethingElse = activity === "Something else";

  function save() {
    const trimmedNote = note.trim();
    store.addEntry({
      id: nextId(),
      kind: "movement",
      at: new Date().toISOString(),
      activity,
      duration,
      ...(isSomethingElse && trimmedNote ? { note: trimmedNote } : {}),
    });
    toast({ title: "Movement added", description: "Rest counts as movement too." });
    navigate("/");
  }

  return (
    <CheckinLayout title="Add movement" subtitle="Whatever your body did" backHref="/" onSave={save}>
      <Reassurance>Resting is a valid entry. There's no minimum to log here.</Reassurance>

      <ChoiceField
        label="Activity"
        value={activity}
        onChange={setActivity}
        columns={2}
        testId="choice-activity"
        options={ACTIVITIES.map((a) => ({ value: a, label: a }))}
      />

      {isSomethingElse && (
        <div className="space-y-2">
          <Label htmlFor="movement-note" className="font-sans text-sm font-medium">
            What did you do?
          </Label>
          <Textarea
            id="movement-note"
            data-testid="input-movement-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Danced in the kitchen, gardened, carried groceries..."
            rows={2}
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground font-mono">
            Optional — just so your timeline reflects what actually happened.
          </p>
        </div>
      )}

      <ChoiceField
        label="Duration"
        value={duration}
        onChange={setDuration}
        columns={3}
        testId="choice-duration"
        options={DURATIONS.map((d) => ({ value: d, label: d }))}
      />
    </CheckinLayout>
  );
}
