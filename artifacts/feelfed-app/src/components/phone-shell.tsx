import { Link, useLocation } from "wouter";
import { CalendarDays, Home, TrendingUp, User } from "lucide-react";
import { cn } from "@workspace/feelfed-ds/lib/utils";

const TABS = [
  { href: "/", label: "Today", icon: Home, match: (p: string) => p === "/" },
  {
    href: "/history",
    label: "History",
    icon: CalendarDays,
    match: (p: string) => p.startsWith("/history"),
  },
  {
    href: "/trends",
    label: "Trends",
    icon: TrendingUp,
    match: (p: string) => p.startsWith("/trends"),
  },
  { href: "/you", label: "You", icon: User, match: (p: string) => p.startsWith("/you") },
];

export function PhoneShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-[100dvh] w-full bg-secondary/10 flex justify-center">
      <div className="relative w-full max-w-[26rem] bg-background flex flex-col min-h-[100dvh] shadow-xl md:my-6 md:min-h-[calc(100dvh-3rem)] md:rounded-[2rem] md:overflow-hidden md:border">
        {/* scrollable content */}
        <main className="flex-1 overflow-y-auto pb-24">{children}</main>

        {/* bottom nav */}
        <nav
          className="absolute bottom-0 inset-x-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
          data-testid="nav-bottom"
        >
          <ul className="flex items-stretch justify-around px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            {TABS.map((tab) => {
              const active = tab.match(location);
              const Icon = tab.icon;
              return (
                <li key={tab.href} className="flex-1">
                  <Link
                    href={tab.href}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg py-1.5 text-xs font-medium transition-colors font-sans",
                      active
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    data-testid={`link-tab-${tab.label.toLowerCase()}`}
                  >
                    <Icon className={cn("h-5 w-5", active && "stroke-[2.25]")} />
                    {tab.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
