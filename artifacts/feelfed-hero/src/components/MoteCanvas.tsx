import { useEffect, useRef } from "react";
import { tokens } from "@workspace/feelfed-ds";

interface MoteCanvasProps {
  fullness: number;  // 0-10
  energy: number;    // 0-10
  hydration: number; // 0-10
}

type MoteRing = "fullness" | "energy" | "hydration";

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number; // radius at full value — scaled in draw loop
  opacity: number;
  color: string;
  ring: MoteRing; // which ring this mote reflects (drives size + alpha)
  life: number;   // 0-1
}

export default function MoteCanvas({ fullness, energy, hydration }: MoteCanvasProps) {
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

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const teal = tokens.color.light.primary;   // fullness
    const peach = tokens.color.light.accent;   // energy
    const aqua = "#5FA8C4";                    // hydration

    const RING_COLOR: Record<MoteRing, string> = {
      fullness: teal,
      energy: peach,
      hydration: aqua,
    };

    // Pick which ring a new mote belongs to, weighted by each ring's current
    // value (+ a floor so every ring is always represented a little)
    const pickRing = (): MoteRing => {
      const v = valsRef.current;
      const wf = v.fullness + 1, we = v.energy + 1, wh = v.hydration + 1;
      const r = Math.random() * (wf + we + wh);
      return r < wf ? "fullness" : r < wf + we ? "energy" : "hydration";
    };

    const spawnMote = (): Mote => {
      const ring = pickRing();
      return {
        x: Math.random() * canvas.width,
        y: canvas.height + 10,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(Math.random() * 0.6 + 0.3),
        // Base radius 3–8 — the owning ring's value scales this up in the draw call
        baseRadius: Math.random() * 5 + 3,
        opacity: Math.random() * 0.6 + 0.3,
        color: RING_COLOR[ring],
        ring,
        life: 0,
      };
    };

    const draw = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const vals = valsRef.current;
      // A few motes are always present; count grows with the SUM of all rings.
      // All rings at 0 → 6 motes; all at 10 → ~48.
      const total = vals.fullness + vals.energy + vals.hydration; // 0–30
      const targetCount = Math.round(6 + total * 1.4);

      // Spawn new motes if needed
      while (motesRef.current.length < targetCount) {
        motesRef.current.push(spawnMote());
      }

      // Update and draw motes
      motesRef.current = motesRef.current.filter((mote) => {
        mote.x += mote.vx;
        mote.y += mote.vy;
        // Slow life decay so motes survive the full climb up the viewport
        // instead of fading out partway.
        mote.life += 0.0008;

        // Size + alpha driven by the OWNING ring's current value, so raising
        // any ring visibly grows its motes. Floors keep low values present but small.
        const ringVal = vals[mote.ring] / 10; // 0–1
        const sizeMult = 0.5 + ringVal * 0.6;
        const radius = mote.baseRadius * sizeMult;

        // Fade near top
        const topFade = Math.max(0, mote.y / (canvas.height * 0.3));
        const lifeOpacity = Math.max(0, 1 - mote.life * 0.8);
        const alpha = mote.opacity * topFade * lifeOpacity * (0.5 + ringVal * 0.5);

        if (alpha < 0.01 || mote.y < -20) return false;

        ctx.save();
        ctx.beginPath();
        ctx.arc(mote.x, mote.y, Math.max(0.5, radius), 0, Math.PI * 2);
        ctx.fillStyle = mote.color;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = mote.color;
        ctx.shadowBlur = radius * 3;
        ctx.fill();
        ctx.restore();

        return true;
      });

      // Trim excess
      while (motesRef.current.length > targetCount) {
        motesRef.current.pop();
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}
