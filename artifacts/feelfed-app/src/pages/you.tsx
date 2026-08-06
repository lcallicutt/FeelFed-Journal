import { Link } from "wouter";
import {
  Bell,
  Download,
  Lock,
  Sparkles,
  Info,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@workspace/feelfed-ds/components/ui/card";
import { Switch } from "@workspace/feelfed-ds/components/ui/switch";
import { Button } from "@workspace/feelfed-ds/components/ui/button";
import { Separator } from "@workspace/feelfed-ds/components/ui/separator";
import { toast } from "@workspace/feelfed-ds/hooks/use-toast";
import { useProfile, useEntries } from "@/hooks/use-store";
import { store } from "@/lib/store";

export default function YouPage() {
  const profile = useProfile();
  const entries = useEntries();

  return (
    <div className="px-4 pt-6">
      <div className="mb-5">
        <p className="font-mono text-sm text-muted-foreground">Your space</p>
        <h1 className="font-serif text-3xl leading-tight mt-0.5">You</h1>
      </div>

      {/* Profile summary */}
      <Card className="mb-4">
        <CardContent className="p-4 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary font-serif text-lg">
            {profile.name.slice(0, 1)}
          </span>
          <div className="flex-1">
            <p className="font-sans font-medium" data-testid="text-profile-name">{profile.name}</p>
            <p className="text-sm text-muted-foreground font-mono">
              {entries.length} moments recorded
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Reminders */}
      <p className="font-sans text-sm font-semibold text-muted-foreground px-1 mb-2">Reminders</p>
      <Card className="mb-4">
        <CardContent className="p-0">
          <SettingRow
            icon={Bell}
            title="Reminders"
            description="Occasional soft nudges to check in. Never streaks."
          >
            <Switch
              checked={profile.remindersEnabled}
              onCheckedChange={(v) => store.setProfile({ remindersEnabled: v })}
              aria-label="Reminders"
              data-testid="switch-reminders"
            />
          </SettingRow>
          <Separator />
          <SettingRow
            icon={Sparkles}
            title="Gentle nudges"
            description="Kind prompts, worded without pressure."
          >
            <Switch
              checked={profile.gentleNudges}
              onCheckedChange={(v) => store.setProfile({ gentleNudges: v })}
              aria-label="Gentle nudges"
              data-testid="switch-nudges"
            />
          </SettingRow>
        </CardContent>
      </Card>

      {/* Data */}
      <p className="font-sans text-sm font-semibold text-muted-foreground px-1 mb-2">Your data</p>
      <Card className="mb-4">
        <CardContent className="p-0">
          <SettingRow icon={Lock} title="Private mode" description="Your journal stays on this device.">
            <Switch
              checked={profile.privateMode}
              onCheckedChange={(v) => store.setProfile({ privateMode: v })}
              aria-label="Private mode"
              data-testid="switch-private"
            />
          </SettingRow>
          <Separator />
          <button
            type="button"
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-secondary/5 transition-colors"
            onClick={() =>
              toast({
                title: "Summary export",
                description: "A plain summary of your entries would download here.",
              })
            }
            data-testid="button-export"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <Download className="h-4 w-4" />
            </span>
            <span className="flex-1">
              <span className="block font-sans text-sm font-medium">Export a summary</span>
              <span className="block text-xs text-muted-foreground font-mono">
                A calm recap you could share with a clinician.
              </span>
            </span>
          </button>
        </CardContent>
      </Card>

      {/* Privacy notes */}
      <Card className="mb-4 bg-secondary/5">
        <CardContent className="p-4">
          <div className="flex gap-2.5">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm text-muted-foreground font-mono leading-relaxed">
              <p>
                FeelFed never grades your eating. There are no calorie goals, streaks, or health
                scores — only what you choose to record.
              </p>
              <p>
                This is a prototype. Accounts, sync, and subscriptions aren't built yet, so nothing
                leaves this device.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button asChild variant="outline" className="w-full" data-testid="link-marketing">
        <a href="/" target="_top">
          <ExternalLink className="h-4 w-4" />
          Visit the FeelFed website
        </a>
      </Button>

      <p className="text-center text-xs text-muted-foreground font-mono mt-4">
        <Link href="/" className="text-primary" data-testid="link-back-today">
          Back to Today
        </Link>
      </p>
    </div>
  );
}

function SettingRow({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Bell;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex-1 min-w-0 pr-2">
        <p className="font-sans text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground font-mono">{description}</p>
      </div>
      {children}
    </div>
  );
}
