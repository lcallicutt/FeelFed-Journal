import { useState, useRef, useEffect } from "react";
import { Button } from "@workspace/feelfed-ds/components/ui/button";
import { useJoinWaitlist } from "@workspace/api-client-react";

interface WaitlistModalProps {
  open: boolean;
  onClose: () => void;
}

export default function WaitlistModal({ open, onClose }: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate, isPending, error, reset } = useJoinWaitlist();

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setTimeout(() => {
        setEmail("");
        setSubmitted(false);
        reset();
      }, 300);
    }
  }, [open, reset]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    mutate(
      { email: email.trim() },
      { onSuccess: () => setSubmitted(true) },
    );
  };

  if (!open) return null;

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "hsla(var(--foreground) / 0.15)", backdropFilter: "blur(4px)" }}
    >
      {/* Modal panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl bg-card p-8 shadow-2xl"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-md px-2 py-1 text-foreground/40 hover:text-foreground/70 transition-colors"
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, lineHeight: 1 }}
        >
          ✕
        </button>

        {submitted ? (
          /* Success state */
          <div className="flex flex-col items-center text-center py-2">
            <div className="mb-5 flex h-13 w-13 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl">
              ✓
            </div>
            <h2 className="font-serif text-2xl font-medium text-foreground mb-2">
              You're on the list
            </h2>
            <p className="font-mono text-sm leading-relaxed text-muted-foreground mb-7">
              We'll send you a note when FeelFed is ready for iOS. No spam,
              just the app.
            </p>
            <Button onClick={onClose} className="rounded-full px-7 h-11">
              Done
            </Button>
          </div>
        ) : (
          /* Email capture form */
          <>
            <span className="font-sans mb-3 block text-[10px] uppercase tracking-widest text-primary/75">
              Coming soon to iOS
            </span>
            <h2 className="font-serif mb-2 text-2xl font-medium leading-snug text-foreground">
              Join the waitlist
            </h2>
            <p className="font-mono mb-6 text-sm leading-relaxed text-muted-foreground">
              Be the first to know when FeelFed launches. We'll send one email
              when it's ready — nothing more.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                ref={inputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="font-mono w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition"
              />

              {error && (
                <p className="font-mono text-xs text-destructive">
                  Something went wrong — please try again.
                </p>
              )}

              <Button
                type="submit"
                disabled={isPending || !email.trim()}
                className="rounded-full h-11 text-sm font-medium w-full"
              >
                {isPending ? "Joining…" : "Join the waitlist"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
