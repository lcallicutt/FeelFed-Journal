import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";
import { Button } from "@workspace/feelfed-ds/components/ui/button";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

/** Compact top bar for a screen. Uses back arrow when a route is provided. */
export function ScreenHeader({ title, subtitle, backHref, onBack, right }: ScreenHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3">
      <div className="flex items-center gap-2">
        {backHref ? (
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="-ml-2 shrink-0"
            data-testid="button-back"
          >
            <Link href={backHref} aria-label="Go back">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
        ) : onBack ? (
          <Button
            variant="ghost"
            size="icon"
            className="-ml-2 shrink-0"
            onClick={onBack}
            aria-label="Go back"
            data-testid="button-back"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-xl leading-tight truncate" data-testid="text-screen-title">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-xs text-muted-foreground font-mono truncate">{subtitle}</p>
          ) : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
    </header>
  );
}
