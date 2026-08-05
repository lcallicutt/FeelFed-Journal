import logoUrl from '../assets/feelfed-logo.png';

export function LogoPage() {
  return (
    <div className="space-y-8 rounded-xl border bg-card p-6 text-card-foreground">
      <section className="space-y-4">
        <div>
          <h2 className="font-semibold" style={{ fontFamily: 'Fraunces, serif' }}>FeelFed Logo</h2>
          <p className="text-sm text-muted-foreground">
            Bowl mark with leaf sprigs and a peach dot — the FeelFed brand icon.
          </p>
        </div>

        {/* Light background usage */}
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            On cream / light backgrounds
          </p>
          <div className="flex items-center gap-8 rounded-xl bg-background border p-8">
            <img src={logoUrl} alt="FeelFed logo" className="h-24 w-24 object-contain" />
            <img src={logoUrl} alt="FeelFed logo" className="h-16 w-16 object-contain" />
            <img src={logoUrl} alt="FeelFed logo" className="h-10 w-10 object-contain" />
          </div>
        </div>

        {/* Dark background usage */}
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            On dark / teal backgrounds
          </p>
          <div className="flex items-center gap-8 rounded-xl p-8" style={{ backgroundColor: '#1F4E49' }}>
            <img src={logoUrl} alt="FeelFed logo" className="h-24 w-24 object-contain" />
            <img src={logoUrl} alt="FeelFed logo" className="h-16 w-16 object-contain" />
            <img src={logoUrl} alt="FeelFed logo" className="h-10 w-10 object-contain" />
          </div>
        </div>
      </section>

      <section className="space-y-3 border-t pt-6">
        <h3 className="text-sm font-semibold">Anatomy</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><span className="font-medium text-foreground">Bowl</span> — teal (#3A8F88), represents the container of nourishment.</li>
          <li><span className="font-medium text-foreground">Leaf sprigs</span> — teal (#3A8F88), growth and food awareness.</li>
          <li><span className="font-medium text-foreground">Peach dot</span> — peach (#F0A576), the gentle accent of energy and warmth.</li>
        </ul>
      </section>

      <section className="space-y-3 border-t pt-6">
        <h3 className="text-sm font-semibold">Logo files</h3>
        <ul className="space-y-1 text-sm text-muted-foreground font-mono">
          <li>docs/references/logos/feelfed-cream-logo.png — cream background mark (hero interactive center)</li>
          <li>docs/references/logos/feelfed-teal-icon.png — teal rounded-square app icon (favicon)</li>
        </ul>
      </section>
    </div>
  );
}
