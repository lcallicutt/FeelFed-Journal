import { ScreenHeader } from "@/components/screen-header";
import { Button } from "@workspace/feelfed-ds/components/ui/button";

/** Shared scaffold for check-in flows: header, scrollable body, sticky save bar. */
export function CheckinLayout({
  title,
  subtitle,
  backHref,
  onSave,
  saveLabel = "Save",
  saveDisabled,
  children,
}: {
  title: string;
  subtitle?: string;
  backHref: string;
  onSave: () => void;
  saveLabel?: string;
  saveDisabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <ScreenHeader title={title} subtitle={subtitle} backHref={backHref} />
      <div className="flex-1 px-4 py-5 space-y-6">{children}</div>
      <div className="sticky bottom-0 border-t bg-background/95 backdrop-blur px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <Button
          className="w-full"
          size="lg"
          onClick={onSave}
          disabled={saveDisabled}
          data-testid="button-save-checkin"
        >
          {saveLabel}
        </Button>
      </div>
    </div>
  );
}
