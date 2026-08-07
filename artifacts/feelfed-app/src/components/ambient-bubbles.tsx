import { useEffect, useRef } from "react";
import { tokens } from "@workspace/feelfed-ds";

/**
 * Ambient rising bubbles, ported from the marketing site's MoteCanvas and
 * adapted for the app: sized to its parent container (the ring hero card)
 * instead of the full viewport, with calmer counts for the smaller area.
 * Purely decorative — pointer-events: none, aria-hidden.
 */
interface AmbientBubblesProps {
  fullness: number; // 0-10
  energy: number; // 0-10
  hydration: number; // 0-10
}

type MoteRing = "fullness" | "energy" | "hydration";

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  opacity: number;
  color: string;
  ring: MoteRing;
  life: number;
}

export default function AmbientBubbles({ fullness, energy, hydration }: AmbientBubblesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motesRef = useRef<Mote[]>([]);
  const animFrameRef = useRef<number>(0);
  const valsRef = useRef({ fullness, energy, hydration });
  valsRef.current = { fullness, energy, hydration };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Respect reduced-motion: no ambient animation at all.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const parent = canvas.parentElement;
    const resize = () => {
      const rect = (parent ?? canvas).getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width));
      canvas.height = Math.max(1, Math.round(rect.height));
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (parent) ro.observe(parent);

    const teal = tokens.color.light.primary; // fullness
    const peach = tokens.color.light.accent; // energy
    const aqua = "#5FA8C4"; // hydration — same palette exception as the ring SVGs

    const RING_COLOR: Record<MoteRing, string> = {
      fullness: teal,
      energy: peach,
      hydration: aqua,
    };

    // Weighted by each ring's current value (+1 floor so every ring shows up)
    const pickRing = (): MoteRing => {
      const v = valsRef.current;
      const wf = v.fullness + 1;
      const we = v.energy + 1;
      const wh = v.hydration + 1;
      const r = Math.random() * (wf + we + wh);
      return r < wf ? "fullness" : r < wf + we ? "energy" : "hydration";
    };

    const spawnMote = (): Mote => {
      const ring = pickRing();
      return {
        x: Math.random() * canvas.width,
        y: canvas.height + 8,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -(Math.random() * 0.45 + 0.2),
        baseRadius: Math.random() * 4 + 2,
        opacity: Math.random() * 0.4 + 0.15,
        color: RING_COLOR[ring],
        ring,
        life: 0,
      };
    };

    const draw = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const vals = valsRef.current;
      // Calmer than the marketing site: all rings at 0 → 3 bubbles; all at 10 → ~24.
      const total = vals.fullness + vals.energy + vals.hydration; // 0–30
      const targetCount = Math.round(3 + total * 0.7);

      while (motesRef.current.length < targetCount) {
        motesRef.current.push(spawnMote());
      }

      motesRef.current = motesRef.current.filter((mote) => {
        mote.x += mote.vx;
        mote.y += mote.vy;
        mote.life += 0.001;

        const ringVal = vals[mote.ring] / 10; // 0–1
        const sizeMult = 0.5 + ringVal * 0.6;
        const radius = mote.baseRadius * sizeMult;

        const topFade = Math.max(0, mote.y / (canvas.height * 0.35));
        const lifeOpacity = Math.max(0, 1 - mote.life * 0.8);
        const alpha = mote.opacity * topFade * lifeOpacity * (0.5 + ringVal * 0.5);

        if (alpha < 0.01 || mote.y < -16) return false;

        ctx.save();
        ctx.beginPath();
        ctx.arc(mote.x, mote.y, Math.max(0.5, radius), 0, Math.PI * 2);
        ctx.fillStyle = mote.color;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = mote.color;
        ctx.shadowBlur = radius * 2.5;
        ctx.fill();
        ctx.restore();

        return true;
      });

      while (motesRef.current.length > targetCount) {
        motesRef.current.pop();
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 h-full w-full pointer-events-none"
    />
  );
}
