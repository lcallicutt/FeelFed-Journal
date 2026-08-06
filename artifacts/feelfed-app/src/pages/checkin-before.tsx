import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "@workspace/feelfed-ds/hooks/use-toast";
import { CheckinLayout } from "@/components/checkin-layout";
import { ChoiceField, ChipMultiSelect, ScaleField } from "@/components/form-controls";
import { Reassurance } from "@/components/reassurance";
import { store, nextId } from "@/lib/store";
import {
  HYDRATION_LABELS,
  MOOD_OPTIONS,
  SENSATION_OPTIONS,
  TIME_SINCE_OPTIONS,
  type HydrationStatus,
} from "@/lib/types";

export default function CheckinBeforePage() {
  const [, navigate] = useLocation();
  const [hunger, setHunger] = useState(4);
  const [energy, setEnergy] = useState(5);
  const [hydration, setHydration] = useState<HydrationStatus>("sips");
  const [timeSince, setTimeSince] = useState(TIME_SINCE_OPTIONS[1]);
  const [mood, setMood] = useState<string>();
  const [sensations, setSensations] = useState<string[]>([]);

  function toggle(s: string) {
    setSensations((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  function save() {
    store.addEntry({
      id: nextId(),
      kind: "before",
      at: new Date().toISOString(),
      hunger,
      energy,
      hydration,
      timeSinceLastAte: timeSince,
      mood: mood ?? "Okay",
      sensations,
    });
    toast({ title: "Check-in saved", description: "Take your time with whatever's next." });
    navigate("/");
  }

  return (
    <CheckinLayout title="Before eating" subtitle="A gentle check-in" backHref="/" onSave={save}>
      <Reassurance>
        There's nothing to get right here. This is just noticing where you are before you eat.
      </Reassurance>

      <ScaleField label="Hunger" value={hunger} onChange={setHunger} lowLabel="Not hungry" highLabel="Very hungry" testId="scale-hunger" />
      <ScaleField label="Energy" value={energy} onChange={setEnergy} lowLabel="Depleted" highLabel="Energised" testId="scale-energy" />

      <ChoiceField
        label="Hydration"
        value={hydration}
        onChange={(v) => setHydration(v as HydrationStatus)}
        columns={2}
        testId="choice-hydration"
        options={(Object.keys(HYDRATION_LABELS) as HydrationStatus[]).map((k) => ({
          value: k,
          label: HYDRATION_LABELS[k],
        }))}
      />

      <ChoiceField
        label="Time since I last ate"
        value={timeSince}
        onChange={setTimeSince}
        columns={2}
        testId="choice-timesince"
        options={TIME_SINCE_OPTIONS.map((t) => ({ value: t, label: t }))}
      />

      <ChoiceField
        label="Mood"
        value={mood}
        onChange={setMood}
        columns={2}
        testId="choice-mood"
        options={MOOD_OPTIONS.map((m) => ({ value: m, label: m }))}
      />

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
