import { useEffect, useRef, useState } from "react";

/**
 * Scroll-reveal hook backed by IntersectionObserver.
 * Mirrors the mockup: fades/slides children in once they enter the viewport,
 * with an optional stagger delay. Respects prefers-reduced-motion by
 * revealing immediately (the CSS also neutralises the transition).
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reduced-motion visitors get the content immediately.
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -60px 0px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, shown };
}

/** Inline transition style for a reveal element. `index` drives the stagger. */
export function revealStyle(shown: boolean, index = 0): React.CSSProperties {
  return {
    opacity: shown ? 1 : 0,
    transform: shown ? "none" : "translateY(26px)",
    transition:
      "opacity 0.8s cubic-bezier(.4,0,.2,1), transform 0.8s cubic-bezier(.4,0,.2,1)",
    transitionDelay: `${(index % 4) * 70}ms`,
  };
}
