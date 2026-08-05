// 16-24s: The rings surface simple journal entries.
// Appetite: Low / Fullness: High / Energy: 4/10 / Food: Four bites
// "FeelFed helps you notice what your body is telling you."

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const ENTRIES = [
  { label: 'Appetite', value: 'Low', color: '#f0a576' },
  { label: 'Fullness', value: 'High', color: '#3a8f88' },
  { label: 'Energy', value: '4 / 10', color: '#5fa8c4' },
  { label: 'Food', value: 'Four bites', color: '#1f4e49' },
];

// positions around the ring orbit (vh offsets from center)
const POS = [
  { x: 0, y: -34 },
  { x: 33, y: -2 },
  { x: 0, y: 34 },
  { x: -33, y: -2 },
];

export function Scene4() {
  const [shown, setShown] = useState(0);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setShown(1), 600),
      setTimeout(() => setShown(2), 1200),
      setTimeout(() => setShown(3), 1800),
      setTimeout(() => setShown(4), 2400),
      setTimeout(() => setShowText(true), 3600),
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
      <div className="relative" style={{ width: 0, height: 0 }}>
        {ENTRIES.map((e, i) => (
          <motion.div
            key={e.label}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-2xl px-[2.4vh] py-[1.3vh] backdrop-blur-sm"
            style={{
              left: `${POS[i].x * 0.55}vh`,
              top: `${POS[i].y * 0.55}vh`,
              background: 'rgba(251,247,242,0.82)',
              boxShadow: '0 6px 22px rgba(31,78,73,0.12)',
              border: '1px solid rgba(58,143,136,0.18)',
            }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={
              shown > i
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 0.7 }
            }
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <span
              className="text-[1.7vh] uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-ui)', color: '#7c8a86' }}
            >
              {e.label}
            </span>
            <span
              className="text-[2.7vh] leading-tight"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 500,
                color: e.color,
              }}
            >
              {e.value}
            </span>
          </motion.div>
        ))}
      </div>

      <motion.p
        className="absolute bottom-[11vh] max-w-[80%] text-center text-[4vh] leading-tight text-ink"
        style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}
        initial={{ opacity: 0, y: 20 }}
        animate={showText ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        FeelFed helps you notice what
        <br />
        your body is telling you.
      </motion.p>
    </motion.div>
  );
}
