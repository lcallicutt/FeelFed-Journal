import { useState } from "react";
import {
  Apple,
  Droplet,
  Footprints,
  Sparkles,
  Utensils,
  Clock3,
  Trash2,
  CircleDot,
} from "lucide-react";
import { Button } from "@workspace/feelfed-ds/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/feelfed-ds/components/ui/alert-dialog";
import type { Entry } from "@/lib/types";
import { entryTitle, summarize, timeOf } from "@/lib/format";
import { store } from "@/lib/store";
import { toast } from "@workspace/feelfed-ds/hooks/use-toast";
import { EntryDetailSheet } from "@/components/entry-detail-sheet";

const ICONS: Record<Entry["kind"], typeof Apple> = {
  before: Utensils,
  during: Apple,
  after: Sparkles,
  hydration: Droplet,
  energy: Sparkles,
  movement: Footprints,
  followup: Clock3,
  moment: CircleDot,
};

export function TimelineEntry({
  entry,
  showLine = true,
  highlighted = false,
}: {
  entry: Entry;
  showLine?: boolean;
  highlighted?: boolean;
}) {
  const Icon = ICONS[entry.kind];
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <li
      id={`entry-${entry.id}`}
      className={`relative flex gap-3 rounded-xl transition-colors duration-700 ${
        highlighted ? "bg-primary/10 -mx-2 px-2" : "bg-transparent"
      }`}
      data-testid={`row-entry-${entry.id}`}
    >
      <div className="flex flex-col items-center">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
          <Icon className="h-4 w-4" />
        </span>
        {showLine ? <span className="w-px flex-1 bg-border mt-1" /> : null}
      </div>

      <div className="flex-1 pb-5 min-w-0">
        <div className="flex items-start justify-between gap-2">
          {/* Tap the row body to open the detail sheet */}
          <button
            type="button"
            onClick={() => setDetailOpen(true)}
            className="min-w-0 text-left rounded-lg -m-1 p-1 transition-colors hover:bg-secondary/10"
            data-testid={`button-open-entry-${entry.id}`}
          >
            <div className="flex items-center gap-2">
              <span className="font-sans text-sm font-medium">{entryTitle(entry.kind)}</span>
              <span className="font-mono text-xs text-muted-foreground">{timeOf(entry.at)}</span>
            </div>
            <p className="text-sm text-muted-foreground font-mono mt-0.5">{summarize(entry)}</p>
            {entry.note ? (
              <p className="text-sm text-foreground/80 font-mono mt-1.5 rounded-lg bg-secondary/10 px-3 py-2">
                {entry.note}
              </p>
            ) : null}
          </button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground shrink-0"
                aria-label="Delete this entry"
                onClick={(e) => e.stopPropagation()}
                data-testid={`button-delete-${entry.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this moment?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove it from your journal.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    store.removeEntry(entry.id);
                    toast({ title: "Entry removed", description: "It's gone from your journal." });
                  }}
                  data-testid="button-confirm-delete"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <EntryDetailSheet entry={entry} open={detailOpen} onOpenChange={setDetailOpen} />
    </li>
  );
}
