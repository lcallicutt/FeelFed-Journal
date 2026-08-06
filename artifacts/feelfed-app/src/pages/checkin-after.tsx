import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "@workspace/feelfed-ds/hooks/use-toast";
import { Textarea } from "@workspace/feelfed-ds/components/ui/textarea";
import { CheckinLayout } from "@/components/checkin-layout";
import { ChoiceField, ChipMultiSelect, ScaleField } from "@/components/form-controls";
import { Reassurance } from "@/components/reassurance";
import { cn } from "@workspace/feelfed-ds/lib/utils";
import { store, nextId } from "@/lib/store";
import {
  AMOUNT_LABELS,
  AMOUNT_ORDER,
  ENERGY_CHANGE_LABELS,
  SENSATION_OPTIONS,
  TEXTURE_LABELS,
  type AfterEntry,
  type AmountEaten,
  type FollowUpMinutes,
  type FoodTexture,
} from "@/lib/types";

const FOLLOWUPS: FollowUpMinutes[] = [30, 45, 60, 90];

export default function CheckinAfterPage() {
  const [, navigate] = useLocation();
  const [amount, setAmount] = useState<AmountEaten>("half");
  const [fullness, setFullness] = useState(6);
  const [satisfaction, setSatisfaction] = useState(6);
  const [energyChange, setEnergyChange] = useState<AfterEntry["energyChange"]>("same");
  const [sensations, setSensations] = useState<string[]>([]);
  const [texture, setTexture] = useState<FoodTexture>("solid");
  const [followUp, setFollowUp] = useState<FollowUpMinutes | undefined>();
  const [note, setNote] = useState("");

  function toggle(s: string) {
    setSensations((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  function save() {
    const afterId = nextId();
    store.addEntry({
      id: afterId,
      kind: "after",
      at: new Date().toISOString(),
      amount,
      fullness,
      satisfaction,
      energyChange,
      sensations,
      texture,
      followUpMinutes: followUp,
      note: note.trim() || undefined,
    });

    if (followUp) {
      const when = new Date(Date.now() + followUp * 60_000);
      store.addEntry({
        id: nextId(),
        kind: "followup",
        at: new Date().toISOString(),
        scheduledFor: when.toISOString(),
        relatesToAfterId: afterId,
        completed: false,
      });
    }

    toast({
      title: "Reflection saved",
      description: followUp
        ? `A follow-up is waiting on Today, ready in about ${followUp} min.`
        : "Thanks for noticing.",
    });
    navigate("/");
  }

  return (
    <CheckinLayout title="After eating" subtitle="A short reflection" backHref="/" onSave={save}>
      <Reassurance>
        However much you ate is the honest answer. We're just recording what happened.
      </Reassurance>

      <ChoiceField
        label="Amount eaten"
        value={amount}
        onChange={(v) => setAmount(v as AmountEaten)}
        columns={3}
        testId="choice-amount"
        options={AMOUNT_ORDER.map((a) => ({ value: a, label: AMOUNT_LABELS[a] }))}
      />

      <ScaleField label="Fullness" value={fullness} onChange={setFullness} lowLabel="Empty" highLabel="Very full" testId="scale-fullness" />
      <ScaleField label="Satisfaction" value={satisfaction} onChange={setSatisfaction} lowLabel="Unsatisfied" highLabel="Satisfied" testId="scale-satisfaction" />

      <ChoiceField
        label="Energy change"
        value={energyChange}
        onChange={(v) => setEnergyChange(v as "lower" | "same" | "higher")}
        columns={3}
        testId="choice-energychange"
        options={(Object.keys(ENERGY_CHANGE_LABELS) as AfterEntry["energyChange"][]).map((k) => ({
          value: k,
          label: ENERGY_CHANGE_LABELS[k],
        }))}
      />

      <ChoiceField
        label="Food texture"
        value={texture}
        onChange={(v) => setTexture(v as FoodTexture)}
        columns={2}
        testId="choice-texture"
        options={(Object.keys(TEXTURE_LABELS) as FoodTexture[]).map((k) => ({
          value: k,
          label: TEXTURE_LABELS[k],
        }))}
      />

      <ChipMultiSelect
        label="Body sensations"
        hint="Optional"
        options={SENSATION_OPTIONS}
        selected={sensations}
        onToggle={toggle}
        testId="chips-sensations"
      />

      <div className="space-y-2">
        <span className="font-sans text-sm font-medium">A note</span>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Anything you want to remember about this (optional)"
          className="font-mono text-sm resize-none"
          rows={3}
          data-testid="input-note"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="font-sans text-sm font-medium">Follow-up reminder</span>
          <span className="text-xs text-muted-foreground font-mono">Optional</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {FOLLOWUPS.map((m) => {
            const active = followUp === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setFollowUp(active ? undefined : m)}
                aria-pressed={active}
                className={cn(
                  "rounded-xl border py-2.5 text-sm font-medium transition-colors font-sans",
                  active
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40",
                )}
                data-testid={`button-followup-${m}`}
              >
                {m}m
              </button>
            );
          })}
        </div>
      </div>
    </CheckinLayout>
  );
}
