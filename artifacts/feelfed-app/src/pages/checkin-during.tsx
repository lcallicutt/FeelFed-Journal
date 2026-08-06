import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "@workspace/feelfed-ds/hooks/use-toast";
import { Switch } from "@workspace/feelfed-ds/components/ui/switch";
import { CheckinLayout } from "@/components/checkin-layout";
import { ChoiceField, ScaleField } from "@/components/form-controls";
import { Reassurance } from "@/components/reassurance";
import { store, nextId } from "@/lib/store";
import { AMOUNT_LABELS, AMOUNT_ORDER, type AmountEaten } from "@/lib/types";

export default function CheckinDuringPage() {
  const [, navigate] = useLocation();
  const [amount, setAmount] = useState<AmountEaten>("few-bites");
  const [fullness, setFullness] = useState(4);
  const [comfort, setComfort] = useState(6);
  const [pauseReminder, setPauseReminder] = useState(false);

  function save() {
    store.addEntry({
      id: nextId(),
      kind: "during",
      at: new Date().toISOString(),
      amount,
      fullness,
      comfort,
      pauseReminder,
    });
    toast({
      title: "Noted mid-meal",
      description: pauseReminder
        ? "Saved your intention to pause and check in with your body."
        : "However much felt right.",
    });
    navigate("/");
  }

  return (
    <CheckinLayout title="During eating" subtitle="A quick pause" backHref="/" onSave={save}>
      <Reassurance>
        Stopping after a few bites is a complete entry. This isn't about finishing.
      </Reassurance>

      <ChoiceField
        label="How much so far"
        value={amount}
        onChange={(v) => setAmount(v as AmountEaten)}
        columns={3}
        testId="choice-amount"
        options={AMOUNT_ORDER.map((a) => ({ value: a, label: AMOUNT_LABELS[a] }))}
      />

      <ScaleField label="Current fullness" value={fullness} onChange={setFullness} lowLabel="Empty" highLabel="Very full" testId="scale-fullness" />
      <ScaleField label="Comfort" value={comfort} onChange={setComfort} lowLabel="Uneasy" highLabel="At ease" testId="scale-comfort" />

      <div className="flex items-center justify-between rounded-xl border bg-card px-3.5 py-3">
        <div className="pr-3">
          <p className="font-sans text-sm font-medium">Note a pause</p>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            Mark that you'd like to pause and check in with your body.
          </p>
        </div>
        <Switch
          checked={pauseReminder}
          onCheckedChange={setPauseReminder}
          aria-label="Pause reminder"
          data-testid="switch-pause-reminder"
        />
      </div>
    </CheckinLayout>
  );
}
