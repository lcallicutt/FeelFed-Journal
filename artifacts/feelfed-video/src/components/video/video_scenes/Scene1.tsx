// 0-4s: Cream. The FeelFed rings expand and settle around the bowl.
// "Some days, a full meal feels impossible."

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1400),
      setTimeout(() => setPhase(2), 3400),
    ];
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-end pb-[16vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
    >
      <motion.p
        className="max-w-[74%] text-center text-[4.6vh] leading-tight text-ink"
        style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}
        initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
        animate={
          phase >= 1
            ? { opacity: 1, y: 0, filter: 'blur(0px)' }
            : { opacity: 0, y: 24, filter: 'blur(8px)' }
        }
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      >
        Some days, a full meal
        <br />
        <em className="not-italic" style={{ color: '#3a8f88' }}>
          feels impossible.
        </em>
      </motion.p>

      {/* gentle breathing underline accent */}
      <motion.div
        className="mt-[3vh] h-[3px] rounded-full"
        style={{ background: '#f0a576' }}
        initial={{ width: 0, opacity: 0 }}
        animate={
          phase >= 2
            ? { width: '9vh', opacity: 0.7 }
            : { width: 0, opacity: 0 }
        }
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.div>
  );
}
