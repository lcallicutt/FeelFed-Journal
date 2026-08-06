import { Slider } from "@workspace/feelfed-ds/components/ui/slider";
import { cn } from "@workspace/feelfed-ds/lib/utils";

/** A 0-10 scale with gentle end labels. */
export function ScaleField({
  label,
  value,
  onChange,
  lowLabel,
  highLabel,
  testId,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  lowLabel: string;
  highLabel: string;
  testId?: string;
}) {
  return (
    <div className="space-y-3" data-testid={testId}>
      <div className="flex items-baseline justify-between">
        <span className="font-sans text-sm font-medium">{label}</span>
        <span className="font-mono text-sm text-primary tabular-nums" data-testid={`${testId}-value`}>
          {value}
          <span className="text-muted-foreground">/10</span>
        </span>
      </div>
      <Slider
        value={[value]}
        min={0}
        max={10}
        step={1}
        onValueChange={(v) => onChange(v[0] ?? 0)}
        aria-label={label}
      />
      <div className="flex justify-between text-xs text-muted-foreground font-mono">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

/** Segmented single-choice grid (used for amount eaten, textures, etc). */
export function ChoiceField<T extends string>({
  label,
  value,
  onChange,
  options,
  columns = 2,
  testId,
}: {
  label: string;
  value: T | undefined;
  onChange: (v: T) => void;
  options: { value: T; label: string; hint?: string }[];
  columns?: 2 | 3 | 5;
  testId?: string;
}) {
  const colClass =
    columns === 5 ? "grid-cols-5" : columns === 3 ? "grid-cols-3" : "grid-cols-2";
  return (
    <div className="space-y-2" data-testid={testId}>
      <span className="font-sans text-sm font-medium">{label}</span>
      <div className={cn("grid gap-2", colClass)}>
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              aria-pressed={active}
              className={cn(
                "rounded-xl border px-2.5 py-2.5 text-center transition-colors font-sans",
                active
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40",
              )}
              data-testid={`${testId}-option-${opt.value}`}
            >
              <span className="block text-sm font-medium leading-tight">{opt.label}</span>
              {opt.hint ? (
                <span className="block text-[0.65rem] text-muted-foreground mt-0.5">
                  {opt.hint}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Chip multi-select for optional sensations. */
export function ChipMultiSelect({
  label,
  hint,
  options,
  selected,
  onToggle,
  testId,
}: {
  label: string;
  hint?: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  testId?: string;
}) {
  return (
    <div className="space-y-2" data-testid={testId}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-sans text-sm font-medium">{label}</span>
        {hint ? <span className="text-xs text-muted-foreground font-mono">{hint}</span> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              aria-pressed={active}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-colors font-sans",
                active
                  ? "border-accent bg-accent/20 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-accent/50",
              )}
              data-testid={`${testId}-chip-${opt.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
