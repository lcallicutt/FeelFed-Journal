import { useEffect, useRef } from "react";
import { tokens } from "@workspace/feelfed-ds";

interface MoteCanvasProps {
  energy: number; // 0-10
}

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number; // radius at full energy — scaled in draw loop
  opacity: number;
  color: string;
  life: number; // 0-1
}

export default function MoteCanvas({ energy }: MoteCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motesRef = useRef<Mote[]>([]);
  const animFrameRef = useRef<number>(0);
  const energyRef = useRef(energy);
  energyRef.current = energy;

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

    const teal = tokens.color.light.primary;
    const peach = tokens.color.light.accent;

    const spawnMote = (): Mote => ({
      x: Math.random() * canvas.width,
      y: canvas.height + 10,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(Math.random() * 0.6 + 0.3),
      // Base radius 3–8 — energy scales this up in the draw call
      baseRadius: Math.random() * 5 + 3,
      opacity: Math.random() * 0.6 + 0.3,
      color: Math.random() > 0.5 ? teal : peach,
      life: 0,
    });

    const draw = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const energyVal = energyRef.current;
      const targetCount = Math.round(energyVal * 2.5); // 0–25 motes

      // Spawn new motes if needed
      while (motesRef.current.length < targetCount) {
        motesRef.current.push(spawnMote());
      }

      // Energy size multiplier: 0.3 at low energy → 1.0 at full energy
      // So at energy=0 motes are tiny/invisible; at energy=10 they're full base radius
      const sizeMult = 0.3 + (energyVal / 10) * 0.7;

      // Update and draw motes
      motesRef.current = motesRef.current.filter((mote) => {
        mote.x += mote.vx;
        mote.y += mote.vy;
        mote.life += 0.003;

        const radius = mote.baseRadius * sizeMult;

        // Fade near top
        const topFade = Math.max(0, mote.y / (canvas.height * 0.3));
        const lifeOpacity = Math.max(0, 1 - mote.life * 0.8);
        const alpha = mote.opacity * topFade * lifeOpacity * (energyVal / 10);

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
