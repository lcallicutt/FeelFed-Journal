import { Heart } from "lucide-react";

/** A soft, non-judgmental note. Reinforces that partial entries are valid. */
export function Reassurance({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 rounded-xl bg-accent/15 px-3.5 py-3" data-testid="text-reassurance">
      <Heart className="h-4 w-4 text-accent-foreground/70 shrink-0 mt-0.5" />
      <p className="text-sm text-foreground/80 font-mono leading-relaxed">{children}</p>
    </div>
  );
}
