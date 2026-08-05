// 38-42s: Peach flood transition with the teal logo. Final lockup.
// "FeelFed" / "Feed the data. Honor the feeling." + soft CTA line.

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const tealIcon = `${import.meta.env.BASE_URL}feelfed-teal-icon.png`;

export function Scene7() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500), // logo
      setTimeout(() => setPhase(2), 1200), // wordmark + tagline
      setTimeout(() => setPhase(3), 2400), // cta
    ];
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
    >
      <div className="flex flex-col items-center">
        <motion.img
          src={tealIcon}
          alt="FeelFed"
          className="rounded-[2.4vh] object-contain"
          style={{
            width: '18vh',
            height: '18vh',
            boxShadow: '0 12px 40px rgba(31,78,73,0.25)',
          }}
          initial={{ opacity: 0, scale: 0.6, y: 10 }}
          animate={
            phase >= 1
              ? { opacity: 1, scale: 1, y: 0 }
              : { opacity: 0, scale: 0.6, y: 10 }
          }
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        />

        <motion.h1
          className="mt-[3.5vh] text-[8vh] leading-none tracking-tight"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            color: '#1f4e49',
          }}
          initial={{ opacity: 0, y: 22 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          FeelFed
        </motion.h1>

        <motion.p
          className="mt-[1.4vh] text-[3.4vh] leading-tight"
          style={{ fontFamily: 'var(--font-body)', color: '#3a8f88' }}
          initial={{ opacity: 0, y: 16 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          Feed the data. Honor the feeling.
        </motion.p>

        <motion.p
          className="mt-[4vh] rounded-full px-[3vh] py-[1.2vh] text-[2.2vh] tracking-wide"
          style={{
            fontFamily: 'var(--font-ui)',
            color: '#1f4e49',
            background: 'rgba(255,255,255,0.5)',
            border: '1px solid rgba(31,78,73,0.2)',
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          Join the early-access list at FeelFed.com
        </motion.p>
      </div>
    </motion.div>
  );
}
