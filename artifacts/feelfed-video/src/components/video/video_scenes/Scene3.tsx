// 10-16s: The four bites transform into four soft teal data dots that travel
// into the rings. "Four bites is still data."

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// start (in bowl) -> end (settling onto the ring orbit)
const DOTS = [
  { sx: -19, sy: -3, ex: 0, ey: -30 },
  { sx: -6, sy: -8, ex: 27, ey: 0 },
  { sx: 7, sy: -7, ex: 0, ey: 30 },
  { sx: 18, sy: -2, ex: -27, ey: 0 },
];

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300), // dots appear as bites
      setTimeout(() => setPhase(2), 1600), // morph to teal + travel
      setTimeout(() => setPhase(3), 2600), // text
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
        {DOTS.map((d, i) => {
          const traveled = phase >= 2;
          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{ width: '2.2vh', height: '2.2vh' }}
              initial={{
                left: `${d.sx * 0.55}vh`,
                top: `${d.sy * 0.55}vh`,
                background: '#f0a576',
                scale: 0,
                opacity: 0,
              }}
              animate={{
                left: traveled ? `${d.ex * 0.55}vh` : `${d.sx * 0.55}vh`,
                top: traveled ? `${d.ey * 0.55}vh` : `${d.sy * 0.55}vh`,
                background: traveled ? '#3a8f88' : '#f0a576',
                scale: phase >= 1 ? 1 : 0,
                opacity: phase >= 1 ? 1 : 0,
                boxShadow: traveled
                  ? '0 0 14px rgba(58,143,136,0.55)'
                  : '0 1px 4px rgba(31,78,73,0.15)',
              }}
              transition={{
                left: { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 },
                top: { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 },
                background: { duration: 0.7 },
                scale: { duration: 0.5, delay: i * 0.08 },
                opacity: { duration: 0.5, delay: i * 0.08 },
              }}
            />
          );
        })}
      </div>

      <motion.p
        className="absolute bottom-[15vh] max-w-[76%] text-center text-[5vh] leading-tight text-ink"
        style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
        animate={
          phase >= 3
            ? { opacity: 1, y: 0, filter: 'blur(0px)' }
            : { opacity: 0, y: 20, filter: 'blur(6px)' }
        }
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        Four bites is{' '}
        <span style={{ color: '#3a8f88' }}>still data.</span>
      </motion.p>
    </motion.div>
  );
}
