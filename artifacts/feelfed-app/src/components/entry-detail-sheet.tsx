import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@workspace/feelfed-ds/components/ui/sheet";
import { Button } from "@workspace/feelfed-ds/components/ui/button";
import { Input } from "@workspace/feelfed-ds/components/ui/input";
import { Textarea } from "@workspace/feelfed-ds/components/ui/textarea";
import { toast } from "@workspace/feelfed-ds/hooks/use-toast";
import type {
  AfterEntry,
  AmountEaten,
  BeforeEntry,
  DuringEntry,
  EnergyEntry,
  Entry,
  HydrationEntry,
  HydrationStatus,
  MomentEntry,
  MovementEntry,
} from "@/lib/types";
import { AMOUNT_LABELS, HYDRATION_LABELS } from "@/lib/types";
import { entryFields, entryTitle, timeOf } from "@/lib/format";
import { store } from "@/lib/store";
import { ScaleField, ChoiceField } from "@/components/form-controls";

/**
 * Bottom sheet showing the complete entry, formatted consistently with the
 * timeline (see lib/format). Includes an Edit action that mutates the same
 * journal record via store.updateEntry — never creates a duplicate.
 */
export function EntryDetailSheet({
  entry,
  open,
  onOpenChange,
}: {
  entry: Entry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [editing, setEditing] = useState(false);

  // Reset to read mode whenever a different entry opens.
  useEffect(() => {
    if (open) setEditing(false);
  }, [open, entry?.id]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[85dvh] overflow-y-auto">
        {entry && (
          <>
            <SheetHeader className="text-left">
              <SheetTitle className="font-serif text-xl">
                {entryTitle(entry.kind)} {timeOf(entry.at)}
              </SheetTitle>
              <SheetDescription className="font-mono">
                {new Date(entry.at).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </SheetDescription>
            </SheetHeader>

            {editing ? (
              <EntryEditForm
                // Remount whenever the edit session starts or the record
                // changes, so field state always initializes from the
                // current store values (never a stale prior edit).
                key={`${entry.id}:${JSON.stringify(entry)}`}
                entry={entry}
                onDone={() => setEditing(false)}
                onSaved={() => {
                  setEditing(false);
                  toast({ title: "Entry updated", description: "Your changes are saved." });
                }}
              />
            ) : (
              <ReadView entry={entry} onEdit={() => setEditing(true)} />
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ReadView({ entry, onEdit }: { entry: Entry; onEdit: () => void }) {
  const fields = entryFields(entry);
  return (
    <>
      <dl className="mt-4 space-y-2.5">
        {fields.map((f) => (
          <div
            key={f.label}
            className="flex items-baseline justify-between gap-4 border-b border-border/60 pb-2.5"
          >
            <dt className="font-sans text-sm text-muted-foreground">{f.label}</dt>
            <dd className="font-mono text-sm text-foreground text-right">{f.value}</dd>
          </div>
        ))}
      </dl>

      {entry.note ? (
        <p className="font-mono text-sm text-foreground/80 mt-4 rounded-xl bg-secondary/10 px-3 py-2.5">
          {entry.note}
        </p>
      ) : null}

      <SheetFooter className="mt-6">
        <Button onClick={onEdit} className="w-full" data-testid="button-edit-entry">
          Edit entry
        </Button>
      </SheetFooter>
    </>
  );
}

/**
 * Simple edit form covering each kind's editable values. Calls
 * store.updateEntry(id, patch) so the same record is mutated in place.
 */
function EntryEditForm({
  entry,
  onDone,
  onSaved,
}: {
  entry: Entry;
  onDone: () => void;
  onSaved: () => void;
}) {
  const [note, setNote] = useState(entry.note ?? "");

  // Kind-specific local state
  const [num, setNum] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    switch (entry.kind) {
      case "before":
        init.hunger = entry.hunger;
        init.energy = entry.energy;
        break;
      case "during":
        init.fullness = entry.fullness;
        init.comfort = entry.comfort;
        break;
      case "after":
        init.fullness = entry.fullness;
        init.satisfaction = entry.satisfaction;
        break;
      case "energy":
        init.level = entry.level;
        break;
      case "moment":
        init.fullness = entry.fullness;
        init.energy = entry.energy;
        init.hydration = entry.hydration;
        break;
    }
    return init;
  });
  const [hydration, setHydration] = useState<HydrationStatus>(
    entry.kind === "hydration"
      ? entry.status
      : entry.kind === "before"
        ? entry.hydration
        : "steady",
  );
  const [amount, setAmount] = useState<AmountEaten>(
    entry.kind === "during" || entry.kind === "after" ? entry.amount : "half",
  );
  const [activity, setActivity] = useState(entry.kind === "movement" ? entry.activity : "");
  const [duration, setDuration] = useState(entry.kind === "movement" ? entry.duration : "");

  const setN = (key: string, v: number) => setNum((p) => ({ ...p, [key]: v }));

  function save() {
    const noteVal = note.trim() ? note.trim() : undefined;
    switch (entry.kind) {
      case "before":
        store.updateEntry(entry.id, {
          hunger: num.hunger,
          energy: num.energy,
          hydration,
          note: noteVal,
        } as Partial<BeforeEntry>);
        break;
      case "during":
        store.updateEntry(entry.id, {
          fullness: num.fullness,
          comfort: num.comfort,
          amount,
          note: noteVal,
        } as Partial<DuringEntry>);
        break;
      case "after":
        store.updateEntry(entry.id, {
          fullness: num.fullness,
          satisfaction: num.satisfaction,
          amount,
          note: noteVal,
        } as Partial<AfterEntry>);
        break;
      case "hydration":
        store.updateEntry(entry.id, { status: hydration, note: noteVal } as Partial<HydrationEntry>);
        break;
      case "energy":
        store.updateEntry(entry.id, { level: num.level, note: noteVal } as Partial<EnergyEntry>);
        break;
      case "movement":
        store.updateEntry(entry.id, {
          activity,
          duration,
          note: noteVal,
        } as Partial<MovementEntry>);
        break;
      case "moment":
        store.updateEntry(entry.id, {
          fullness: num.fullness,
          energy: num.energy,
          hydration: num.hydration,
          note: noteVal,
        } as Partial<MomentEntry>);
        break;
      default:
        store.updateEntry(entry.id, { note: noteVal });
    }
    onSaved();
  }

  const hydrationOptions = (Object.keys(HYDRATION_LABELS) as HydrationStatus[]).map((k) => ({
    value: k,
    label: HYDRATION_LABELS[k],
  }));
  const amountOptions = (Object.keys(AMOUNT_LABELS) as AmountEaten[]).map((k) => ({
    value: k,
    label: AMOUNT_LABELS[k],
  }));

  return (
    <div className="mt-4 space-y-5">
      {entry.kind === "before" && (
        <>
          <ScaleField
            label="Hunger"
            value={num.hunger}
            onChange={(v) => setN("hunger", v)}
            lowLabel="Not hungry"
            highLabel="Very hungry"
          />
          <ScaleField
            label="Energy"
            value={num.energy}
            onChange={(v) => setN("energy", v)}
            lowLabel="Depleted"
            highLabel="Energised"
          />
          <ChoiceField
            label="Hydration"
            value={hydration}
            onChange={(v) => setHydration(v as HydrationStatus)}
            columns={2}
            options={hydrationOptions}
          />
        </>
      )}

      {entry.kind === "during" && (
        <>
          <ChoiceField
            label="Amount eaten"
            value={amount}
            onChange={(v) => setAmount(v as AmountEaten)}
            columns={2}
            options={amountOptions}
          />
          <ScaleField
            label="Fullness"
            value={num.fullness}
            onChange={(v) => setN("fullness", v)}
            lowLabel="Empty"
            highLabel="Very full"
          />
          <ScaleField
            label="Comfort"
            value={num.comfort}
            onChange={(v) => setN("comfort", v)}
            lowLabel="Uneasy"
            highLabel="At ease"
          />
        </>
      )}

      {entry.kind === "after" && (
        <>
          <ChoiceField
            label="Amount eaten"
            value={amount}
            onChange={(v) => setAmount(v as AmountEaten)}
            columns={2}
            options={amountOptions}
          />
          <ScaleField
            label="Fullness"
            value={num.fullness}
            onChange={(v) => setN("fullness", v)}
            lowLabel="Empty"
            highLabel="Very full"
          />
          <ScaleField
            label="Satisfaction"
            value={num.satisfaction}
            onChange={(v) => setN("satisfaction", v)}
            lowLabel="Not satisfied"
            highLabel="Satisfied"
          />
        </>
      )}

      {entry.kind === "hydration" && (
        <ChoiceField
          label="Hydration"
          value={hydration}
          onChange={(v) => setHydration(v as HydrationStatus)}
          columns={2}
          options={hydrationOptions}
        />
      )}

      {entry.kind === "energy" && (
        <ScaleField
          label="Energy"
          value={num.level}
          onChange={(v) => setN("level", v)}
          lowLabel="Depleted"
          highLabel="Energised"
        />
      )}

      {entry.kind === "movement" && (
        <>
          <div className="space-y-2">
            <span className="font-sans text-sm font-medium">Activity</span>
            <Input
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              data-testid="input-edit-activity"
            />
          </div>
          <div className="space-y-2">
            <span className="font-sans text-sm font-medium">Duration</span>
            <Input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              data-testid="input-edit-duration"
            />
          </div>
        </>
      )}

      {entry.kind === "moment" && (
        <>
          <ScaleField
            label="Fullness"
            value={num.fullness}
            onChange={(v) => setN("fullness", v)}
            lowLabel="Empty"
            highLabel="Very full"
          />
          <ScaleField
            label="Energy"
            value={num.energy}
            onChange={(v) => setN("energy", v)}
            lowLabel="Depleted"
            highLabel="Energised"
          />
          <ScaleField
            label="Hydration"
            value={num.hydration}
            onChange={(v) => setN("hydration", v)}
            lowLabel="Dry"
            highLabel="Well watered"
          />
        </>
      )}

      <div className="space-y-2">
        <span className="font-sans text-sm font-medium">Note</span>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Anything you want to remember about this."
          rows={3}
          data-testid="textarea-edit-note"
        />
      </div>

      <SheetFooter className="gap-2 sm:gap-2">
        <Button variant="outline" onClick={onDone} className="flex-1" data-testid="button-cancel-edit">
          Cancel
        </Button>
        <Button onClick={save} className="flex-1" data-testid="button-save-edit">
          Save changes
        </Button>
      </SheetFooter>
    </div>
  );
}
