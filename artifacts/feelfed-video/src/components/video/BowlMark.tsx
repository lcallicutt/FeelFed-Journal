// FeelFed bowl mark, drawn as inline SVG so it can be animated crisply.
// Matches the brand logo: teal bowl, two teal leaves, peach seed + berry.

import { motion } from 'framer-motion';

interface BowlMarkProps {
  /** 0..1 how full the bowl water sits */
  fill?: number;
  /** overall size (px number or CSS length string) */
  size?: number | string;
  className?: string;
}

const TEAL = '#3a8f88';
const TEAL_DEEP = '#1f4e49';
const PEACH = '#f0a576';
const WATER = '#5fa8c4';

export function BowlMark({ fill = 0.3, size = 240, className }: BowlMarkProps) {
  // bowl interior spans y ~ 108..168; water rises from bottom
  const waterTop = 168 - Math.max(0, Math.min(1, fill)) * 56;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      className={className}
    >
      <defs>
        <clipPath id="bowlClip">
          <path d="M56 108 H144 A44 44 0 0 1 56 108 Z" />
        </clipPath>
      </defs>

      {/* leaves */}
      <motion.path
        d="M92 104 C 70 96, 58 74, 66 58 C 88 66, 98 88, 92 104 Z"
        fill={TEAL}
        animate={{ rotate: [0, -3, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '88px 100px' }}
      />
      <motion.path
        d="M108 104 C 130 96, 142 74, 134 58 C 112 66, 102 88, 108 104 Z"
        fill={TEAL_DEEP}
        animate={{ rotate: [0, 3, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '112px 100px' }}
      />

      {/* peach seed + floating berry */}
      <motion.ellipse
        cx="100"
        cy="88"
        rx="8"
        ry="12"
        fill={PEACH}
        animate={{ y: [0, -1.5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.circle
        cx="100"
        cy="56"
        r="12"
        fill={PEACH}
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* bowl body */}
      <path d="M56 108 H144 A44 44 0 0 1 56 108 Z" fill={TEAL} />

      {/* water fill inside bowl */}
      <g clipPath="url(#bowlClip)">
        <motion.rect
          x="50"
          width="100"
          fill={WATER}
          opacity={0.9}
          animate={{ y: waterTop, height: 200 - waterTop }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </g>
    </svg>
  );
}
