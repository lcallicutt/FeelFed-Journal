import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';

const CORE_SWATCHES = [
  { name: 'Primary — Teal', hex: '#3A8F88', className: 'bg-primary' },
  { name: 'Secondary — Deep Teal', hex: '#1F4E49', className: 'bg-secondary' },
  { name: 'Accent — Peach', hex: '#F0A576', className: 'bg-accent' },
] as const;

const SUPPORTING_SWATCHES = [
  { name: 'Cream BG', hex: '#FBF7F2', className: 'border bg-background' },
  { name: 'Foreground', hex: '#1F4E49', className: 'bg-foreground' },
  { name: 'Muted', hex: '#EDE7DF', className: 'bg-muted' },
  { name: 'Water Blue', hex: '#5FA8C4', className: 'bg-[#5FA8C4]' },
  { name: 'Destructive', hex: '#C0392B', className: 'bg-destructive' },
] as const;

const SPACING_SCALE = [
  { label: '4', className: 'w-4' },
  { label: '8', className: 'w-8' },
  { label: '12', className: 'w-12' },
  { label: '16', className: 'w-16' },
  { label: '24', className: 'w-24' },
] as const;

function Swatch({
  name,
  hex,
  className,
}: {
  name: string;
  hex?: string;
  className: string;
}) {
  return (
    <div className="space-y-2">
      <div className={`h-16 rounded-lg ${className}`} />
      <p className="text-sm font-medium">{name}</p>
      {hex && <p className="text-xs text-muted-foreground font-mono">{hex}</p>}
    </div>
  );
}

export function OverviewPage() {
  return (
    <div className="space-y-4">
      <section className="rounded-xl border bg-card p-5 text-card-foreground">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Core palette
        </h2>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {CORE_SWATCHES.map((swatch) => (
            <Swatch key={swatch.name} {...swatch} />
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-5 text-card-foreground">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Typography
          </h2>
          <div className="mt-4 space-y-3">
            <p className="text-4xl font-bold" style={{ fontFamily: 'Fraunces, serif' }}>
              Display — Fraunces
            </p>
            <p className="text-xl font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Label — Poppins
            </p>
            <p className="text-base" style={{ fontFamily: 'Lato, sans-serif' }}>
              Body — Lato
            </p>
            <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Lato, sans-serif' }}>
              Caption — Lato muted
            </p>
          </div>
        </section>

        <section className="rounded-xl border bg-card p-5 text-card-foreground">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            In use
          </h2>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Fraunces, serif' }}>Log a moment</CardTitle>
              <CardDescription style={{ fontFamily: 'Lato, sans-serif' }}>
                Gentle food and fullness tracking.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="overview-name" style={{ fontFamily: 'Poppins, sans-serif' }}>Meal name</Label>
                <Input id="overview-name" placeholder="What did you eat?" />
              </div>
              <div className="flex items-center gap-2">
                <Switch defaultChecked id="overview-notify" />
                <Label htmlFor="overview-notify" style={{ fontFamily: 'Poppins, sans-serif' }}>Mindful eating</Label>
                <Badge className="ml-auto">New</Badge>
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button>Save</Button>
              <Button variant="outline">Cancel</Button>
            </CardFooter>
          </Card>
        </section>
      </div>

      <section className="space-y-4 rounded-xl border bg-card p-5 text-card-foreground">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Components
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Badge>Badge</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </section>
    </div>
  );
}

export function ColorsPage() {
  return (
    <div className="space-y-8 rounded-xl border bg-card p-6 text-card-foreground">
      <section className="space-y-4">
        <div>
          <h2 className="font-semibold" style={{ fontFamily: 'Fraunces, serif' }}>Brand colors</h2>
          <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Lato, sans-serif' }}>
            The core roles used for emphasis, supporting actions, and accents.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {CORE_SWATCHES.map((swatch) => (
            <Swatch key={swatch.name} {...swatch} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-semibold" style={{ fontFamily: 'Fraunces, serif' }}>Semantic and surface colors</h2>
          <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Lato, sans-serif' }}>
            Roles for backgrounds, borders, muted surfaces, and danger.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {SUPPORTING_SWATCHES.map((swatch) => (
            <Swatch key={swatch.name} {...swatch} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-semibold" style={{ fontFamily: 'Fraunces, serif' }}>Data visualization</h2>
          <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Lato, sans-serif' }}>
            Five chart series colors drawn from the FeelFed palette.
          </p>
        </div>
        <div className="flex gap-3">
          {[
            { name: 'Chart 1', cls: 'bg-[var(--color-chart-1)]' },
            { name: 'Chart 2', cls: 'bg-[var(--color-chart-2)]' },
            { name: 'Chart 3', cls: 'bg-[var(--color-chart-3)]' },
            { name: 'Chart 4', cls: 'bg-[var(--color-chart-4)]' },
            { name: 'Chart 5', cls: 'bg-[var(--color-chart-5)]' },
          ].map((c) => (
            <div key={c.name} className="flex-1 space-y-2">
              <div className={`h-10 rounded-md ${c.cls}`} />
              <p className="text-xs text-muted-foreground">{c.name}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function FontsPage() {
  return (
    <div className="space-y-8 rounded-xl border bg-card p-6 text-card-foreground">
      <section className="space-y-6">
        <div>
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Display — Fraunces
          </h2>
          <p className="mt-3 text-4xl font-bold" style={{ fontFamily: 'Fraunces, serif' }}>
            Four bites is still data.
          </p>
          <p className="mt-2 text-sm text-muted-foreground" style={{ fontFamily: 'Lato, sans-serif' }}>
            Use for hero headlines, section titles, and brand moments. Optical sizing
            makes it feel warm and literary at large sizes.
          </p>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Labels — Poppins
          </h2>
          <p className="mt-3 text-xl font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Fullness · Energy · Hydration
          </p>
          <p className="mt-2 text-sm text-muted-foreground" style={{ fontFamily: 'Lato, sans-serif' }}>
            Use for ring labels, buttons, nav items, badges, and short UI strings.
            Geometric and approachable without being loud.
          </p>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Body — Lato
          </h2>
          <p className="mt-3 text-base leading-relaxed" style={{ fontFamily: 'Lato, sans-serif' }}>
            Low energy after drinking well — your body's redistributing. Lato is
            the reading face: reflection cards, longer descriptions, and anything
            that needs to breathe on the page.
          </p>
          <p className="mt-2 text-sm text-muted-foreground" style={{ fontFamily: 'Lato, sans-serif' }}>
            Use for body copy, reflection text, tooltips, and supporting prose.
          </p>
        </div>
      </section>

      <section className="space-y-4 border-t pt-6">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Type scale
        </h2>
        {[
          { label: 'Display', className: 'text-4xl font-bold', family: 'Fraunces, serif' },
          { label: 'Heading', className: 'text-2xl font-semibold', family: 'Fraunces, serif' },
          { label: 'Label', className: 'text-sm font-medium', family: 'Poppins, sans-serif' },
          { label: 'Body', className: 'text-base', family: 'Lato, sans-serif' },
          { label: 'Caption', className: 'text-sm text-muted-foreground', family: 'Lato, sans-serif' },
        ].map((entry) => (
          <div key={entry.label} className="grid gap-2 sm:grid-cols-[120px_1fr]">
            <span className="pt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {entry.label}
            </span>
            <p className={entry.className} style={{ fontFamily: entry.family }}>
              Nourish with intention.
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}

export function LayoutPage() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-xl border bg-card p-6 text-card-foreground">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Spacing
        </h2>
        <p className="mt-2 text-sm text-muted-foreground" style={{ fontFamily: 'Lato, sans-serif' }}>
          Base step: 4px (0.25rem). Components multiply this step.
        </p>
        <div className="mt-6 space-y-3">
          {SPACING_SCALE.map((entry) => (
            <div key={entry.label} className="flex items-center gap-4">
              <span className="w-8 text-xs text-muted-foreground">{entry.label}</span>
              <div className={`h-4 bg-primary rounded ${entry.className}`} />
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-xl border bg-card p-6 text-card-foreground">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Radius
        </h2>
        <p className="mt-2 text-sm text-muted-foreground" style={{ fontFamily: 'Lato, sans-serif' }}>
          Base: 0.75rem — slightly generous to match FeelFed's organic, gentle tone.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4">
          {[
            { label: 'sm', cls: 'rounded-sm' },
            { label: 'md', cls: 'rounded-md' },
            { label: 'lg (base)', cls: 'rounded-lg' },
            { label: 'xl', cls: 'rounded-xl' },
          ].map(({ label, cls }) => (
            <div key={label} className="space-y-2">
              <div className={`h-16 bg-primary/20 border border-primary/40 ${cls}`} />
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
