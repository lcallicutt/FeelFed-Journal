// 24-32s: The rings orbit the bowl while small icons appear for the five
// things FeelFed tracks. "No judgment. No perfect meals. No starting over."

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Utensils, Droplet, Sparkles, Heart, Zap } from 'lucide-react';

const ICONS = [
  { Icon: Utensils, label: 'Food', color: '#1f4e49', angle: -90 },
  { Icon: Droplet, label: 'Hydration', color: '#5fa8c4', angle: -18 },
  { Icon: Sparkles, label: 'Fullness', color: '#3a8f88', angle: 54 },
  { Icon: Heart, label: 'Mood', color: '#f0a576', angle: 126 },
  { Icon: Zap, label: 'Energy', color: '#e0925f', angle: 198 },
];

const RADIUS = 30; // vh-ish offset

const LINES = ['No judgment.', 'No perfect meals.', 'No starting over.'];

export function Scene5() {
  const [shown, setShown] = useState(0);
  const [line, setLine] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setShown(1), 400),
      setTimeout(() => setShown(2), 700),
      setTimeout(() => setShown(3), 1000),
      setTimeout(() => setShown(4), 1300),
      setTimeout(() => setShown(5), 1600),
      setTimeout(() => setLine(1), 2600),
      setTimeout(() => setLine(2), 3900),
      setTimeout(() => setLine(3), 5200),
    ];
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.7 } }}
    >
      {/* slowly rotating icon orbit around the shared bowl anchor */}
      <motion.div
        className="relative"
        style={{ width: 0, height: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      >
        {ICONS.map(({ Icon, label, color, angle }, i) => {
          const rad = (angle * Math.PI) / 180;
          const x = Math.cos(rad) * RADIUS;
          const y = Math.sin(rad) * RADIUS;
          return (
            <motion.div
              key={label}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-[0.5vh]"
              style={{ left: `${x * 0.55}vh`, top: `${y * 0.55}vh` }}
              initial={{ opacity: 0, scale: 0 }}
              animate={
                shown > i ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }
              }
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            >
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: '6.4vh',
                  height: '6.4vh',
                  background: 'rgba(251,247,242,0.9)',
                  boxShadow: '0 4px 16px rgba(31,78,73,0.14)',
                  border: `1px solid ${color}33`,
                }}
              >
                {/* counter-rotate so icons stay upright */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                >
                  <Icon size={22} color={color} strokeWidth={1.8} />
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* stacked reassurance lines */}
      <div className="absolute bottom-[13vh] flex flex-col items-center gap-[1.2vh]">
        {LINES.map((l, i) => (
          <motion.p
            key={l}
            className="text-[4.2vh] leading-none text-ink"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}
            initial={{ opacity: 0, y: 16 }}
            animate={
              line > i ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }
            }
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {l}
          </motion.p>
        ))}
      </div>
    </motion.div>
  );
}
