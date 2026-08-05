// 4-10s: A bowl with a small serving. Four bite shapes gently disappear, one
// at a time. "Maybe you only managed four bites."

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// four bites arranged in the bowl bowl-interior
const BITES = [
  { x: -34, y: -6 },
  { x: -11, y: -14 },
  { x: 12, y: -13 },
  { x: 33, y: -4 },
];

export function Scene2() {
  const [eaten, setEaten] = useState(0);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setShowText(true), 400),
      setTimeout(() => setEaten(1), 2000),
      setTimeout(() => setEaten(2), 2900),
      setTimeout(() => setEaten(3), 3800),
      setTimeout(() => setEaten(4), 4700),
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
      {/* bites layer, positioned over the shared bowl anchor (screen center) */}
      <div className="relative" style={{ width: 0, height: 0, top: '-1vh' }}>
        {BITES.map((b, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: '2.4vh',
              height: '2.4vh',
              left: `${b.x * 0.55}vh`,
              top: `${b.y * 0.55}vh`,
              background: i % 2 === 0 ? '#f0a576' : '#f6c6a1',
              boxShadow: '0 1px 4px rgba(31,78,73,0.15)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={
              eaten > i
                ? { scale: 0, opacity: 0, y: '-2vh' }
                : { scale: 1, opacity: 1, y: 0 }
            }
            transition={{
              duration: 0.6,
              ease: eaten > i ? 'easeIn' : [0.34, 1.56, 0.64, 1],
              delay: eaten > i ? 0 : 0.6 + i * 0.15,
            }}
          />
        ))}
      </div>

      {/* caption */}
      <motion.p
        className="absolute bottom-[15vh] max-w-[74%] text-center text-[4.4vh] leading-tight text-ink"
        style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}
        initial={{ opacity: 0, y: 20 }}
        animate={showText ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        Maybe you only managed{' '}
        <span style={{ color: '#f0a576', fontWeight: 500 }}>four bites.</span>
      </motion.p>
    </motion.div>
  );
}
