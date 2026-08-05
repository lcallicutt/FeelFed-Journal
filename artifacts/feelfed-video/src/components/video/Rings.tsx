// Concentric FeelFed fullness rings. Persistent anchor that expands, settles,
// and gently rotates. Each ring traces on via pathLength.

import { motion } from 'framer-motion';

interface RingsProps {
  /** 0 = collapsed, 1 = fully expanded/settled */
  progress?: number;
  size?: number | string;
  className?: string;
  /** ring arc completion 0..1 (how much of each ring is drawn) */
  trace?: number;
}

const RINGS = [
  { r: 46, color: '#3a8f88', width: 7, dash: 0.82, dir: 1, dur: 42 },
  { r: 62, color: '#5fa8c4', width: 6, dash: 0.7, dir: -1, dur: 54 },
  { r: 78, color: '#f0a576', width: 5, dash: 0.6, dir: 1, dur: 66 },
];

export function Rings({
  progress = 1,
  size = 420,
  className,
  trace = 1,
}: RingsProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      className={className}
    >
      {RINGS.map((ring, i) => {
        const circumference = 2 * Math.PI * ring.r;
        return (
          <motion.circle
            key={i}
            cx="100"
            cy="100"
            r={ring.r}
            stroke={ring.color}
            strokeWidth={ring.width}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            initial={{ scale: 0.4, opacity: 0, strokeDashoffset: circumference }}
            animate={{
              scale: 0.4 + progress * 0.6,
              opacity: progress * 0.95,
              strokeDashoffset:
                circumference * (1 - ring.dash * trace),
              rotate: ring.dir * 360,
            }}
            transition={{
              scale: { duration: 2.2, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: 1.6, ease: 'easeOut' },
              strokeDashoffset: {
                duration: 1.8,
                delay: 0.2 + i * 0.25,
                ease: [0.22, 1, 0.36, 1],
              },
              rotate: {
                duration: ring.dur,
                repeat: Infinity,
                ease: 'linear',
              },
            }}
            style={{ transformOrigin: '100px 100px' }}
          />
        );
      })}
    </svg>
  );
}
