// 32-38s: Bowl and rings settle to center; the FeelFed wordmark appears
// beneath them. "Just gentle tracking, one moment at a time."

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function Scene6() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 900), // wordmark
      setTimeout(() => setPhase(2), 2200), // caption
    ];
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6 } }}
    >
      {/* wordmark sits below the shared bowl+rings anchor */}
      <motion.div
        className="absolute flex flex-col items-center"
        style={{ top: 'calc(50% + 26vh)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <span
          className="text-[6vh] leading-none tracking-tight"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: '#1f4e49' }}
        >
          FeelFed
        </span>
      </motion.div>

      <motion.p
        className="absolute bottom-[10vh] max-w-[76%] text-center text-[3.8vh] leading-tight"
        style={{ fontFamily: 'var(--font-body)', color: '#5a6a66' }}
        initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
        animate={
          phase >= 2
            ? { opacity: 1, y: 0, filter: 'blur(0px)' }
            : { opacity: 0, y: 16, filter: 'blur(6px)' }
        }
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        Just gentle tracking,
        <br />
        one moment at a time.
      </motion.p>
    </motion.div>
  );
}
