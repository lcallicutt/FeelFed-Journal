import { useState, useRef, useEffect } from "react";
import { Button } from "@workspace/feelfed-ds/components/ui/button";
import { Input } from "@workspace/feelfed-ds/components/ui/input";
import { Label } from "@workspace/feelfed-ds/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/feelfed-ds/components/ui/select";
import { useMutation } from "@tanstack/react-query";

interface WaitlistModalProps {
  open: boolean;
  onClose: () => void;
}

interface WaitlistPayload {
  email: string;
  firstName?: string;
  interest?: string;
}

const INTEREST_OPTIONS = [
  "Appetite and fullness",
  "Energy and hydration",
  "Symptoms after eating",
  "Eating and movement patterns",
  "Preparing information for appointments",
  "Something else",
];

function joinWaitlist(payload: WaitlistPayload): Promise<void> {
  // POST to the API server — the endpoint accepts { email, firstName?, interest? }.
  return fetch("/api/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  }).then((res) => {
    if (!res.ok) throw new Error("Request failed");
  });
}

export default function WaitlistModal({ open, onClose }: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [interest, setInterest] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate, isPending, isError, reset } = useMutation({
    mutationFn: joinWaitlist,
    onSuccess: () => setSubmitted(true),
  });

  // Focus first name when modal opens; reset fields when it closes.
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setTimeout(() => {
        setEmail("");
        setFirstName("");
        setInterest("");
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

  // Focus trap: keep Tab / Shift+Tab within the modal panel
  const handleModalKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const panel = e.currentTarget;
    const focusable = Array.from(
      panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.closest('[aria-hidden="true"]'));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    mutate({
      email: email.trim(),
      firstName: firstName.trim() || undefined,
      interest: interest || undefined,
    });
  };

  if (!open) return null;

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 overflow-y-auto"
      style={{ background: "hsla(var(--foreground) / 0.15)", backdropFilter: "blur(4px)" }}
    >
      {/* Modal panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="waitlist-modal-title"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleModalKeyDown}
        className="relative my-auto w-full max-w-md rounded-2xl bg-card p-8 shadow-2xl"
        data-testid="modal-waitlist"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          data-testid="button-close-waitlist"
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
            <h2 id="waitlist-modal-title" className="font-serif text-2xl font-medium text-foreground mb-2">
              You're on the list
            </h2>
            <p className="font-mono text-sm leading-relaxed text-muted-foreground mb-7">
              We'll send you a note when FeelFed is ready for iOS. No spam,
              just the app.
            </p>
            <Button onClick={onClose} className="rounded-full px-7 h-11" data-testid="button-done-waitlist">
              Done
            </Button>
          </div>
        ) : (
          /* Email capture form */
          <>
            <span className="font-sans mb-3 block text-[10px] uppercase tracking-widest text-primary/75">
              Coming soon to iOS
            </span>
            <h2 id="waitlist-modal-title" className="font-serif mb-2 text-2xl font-medium leading-snug text-foreground">
              Join the early access list
            </h2>
            <p className="font-mono mb-6 text-sm leading-relaxed text-muted-foreground">
              Tell me a little about what you're hoping FeelFed can help with.
              Only your email is required — everything else is optional.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* First name */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="waitlist-first-name" className="font-sans text-xs text-foreground/70">
                  First name
                </Label>
                <Input
                  ref={inputRef}
                  id="waitlist-first-name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Optional"
                  autoComplete="given-name"
                  className="font-mono"
                  data-testid="input-first-name"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="waitlist-email" className="font-sans text-xs text-foreground/70">
                  Email
                </Label>
                <Input
                  id="waitlist-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                  className="font-mono"
                  data-testid="input-email"
                />
              </div>

              {/* Interest */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="waitlist-interest" className="font-sans text-xs text-foreground/70">
                  What would you most like FeelFed to help you understand?
                </Label>
                <Select value={interest} onValueChange={setInterest}>
                  <SelectTrigger id="waitlist-interest" className="font-mono" data-testid="select-interest">
                    <SelectValue placeholder="Optional — choose one" />
                  </SelectTrigger>
                  <SelectContent>
                    {INTEREST_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt} className="font-mono">
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isError && (
                <p className="font-mono text-xs text-destructive" data-testid="text-waitlist-error">
                  Something went wrong — please try again.
                </p>
              )}

              <Button
                type="submit"
                disabled={isPending || !email.trim()}
                className="rounded-full h-11 text-sm font-medium w-full mt-1"
                data-testid="button-submit-waitlist"
              >
                {isPending ? "Joining…" : "Join the early access list"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
