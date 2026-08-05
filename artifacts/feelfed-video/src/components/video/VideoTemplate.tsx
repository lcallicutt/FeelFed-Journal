// FeelFed brand story — vertical 9:16 motion piece.
// A single bowl + rings anchor persists across every scene and transforms;
// only scene-specific captions and props mount inside AnimatePresence.

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { BowlMark } from './BowlMark';
import { Rings } from './Rings';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';
import { Scene6 } from './video_scenes/Scene6';
import { Scene7 } from './video_scenes/Scene7';

export const SCENE_DURATIONS = {
  open: 4000, // rings expand around bowl
  bites: 6000, // four bites disappear
  data: 6000, // bites -> teal data dots
  journal: 8000, // ring journal entries
  facets: 8000, // orbiting icons + reassurance
  logo: 6000, // wordmark reveal
  close: 4000, // peach flood + lockup
};

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  open: Scene1,
  bites: Scene2,
  data: Scene3,
  journal: Scene4,
  facets: Scene5,
  logo: Scene6,
  close: Scene7,
};

// cumulative scene start offsets (seconds) for audio sync
const SCENE_START_SEC: Record<string, number> = (() => {
  const out: Record<string, number> = {};
  let cumulativeMs = 0;
  for (const [key, ms] of Object.entries(SCENE_DURATIONS)) {
    out[key] = cumulativeMs / 1000;
    cumulativeMs += ms;
  }
  return out;
})();

const AUDIO_SEEK_EPSILON_SEC = 0.18;

// bowl water fill per scene (0..1) — rises as the story reframes fullness
const BOWL_FILL = [0.25, 0.35, 0.4, 0.85, 0.6, 0.55, 0.55];
// ring expansion progress per scene
const RING_PROGRESS = [1, 1, 1, 1, 1, 1, 0.6];
// anchor scale/opacity per scene — steps back when captions need room, fades on close
const ANCHOR = [
  { scale: 1, opacity: 1, y: '-2vh' },
  { scale: 0.92, opacity: 1, y: '-1vh' },
  { scale: 0.92, opacity: 1, y: '-1vh' },
  { scale: 0.98, opacity: 1, y: '-4vh' },
  { scale: 0.9, opacity: 1, y: '-3vh' },
  { scale: 0.82, opacity: 1, y: '-6vh' },
  { scale: 0.7, opacity: 0, y: '-8vh' },
];

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  muted = false,
  onSceneChange,
}: {
  durations?: Record<string, number>;
  loop?: boolean;
  muted?: boolean;
  onSceneChange?: (sceneKey: string) => void;
} = {}) {
  const { currentSceneKey } = useVideoPlayer({ durations, loop });

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  const baseSceneKey = currentSceneKey.replace(
    /_r[12]$/,
    '',
  ) as keyof typeof SCENE_DURATIONS;
  const sceneIndex = Object.keys(SCENE_DURATIONS).indexOf(baseSceneKey);
  const SceneComponent = SCENE_COMPONENTS[baseSceneKey];

  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.45;
    const targetTime = SCENE_START_SEC[baseSceneKey] ?? 0;
    if (Math.abs(audio.currentTime - targetTime) > AUDIO_SEEK_EPSILON_SEC) {
      audio.currentTime = targetTime;
    }
    audio.play().catch(() => {});
  }, [currentSceneKey, baseSceneKey, muted]);

  const isClose = sceneIndex === 6;
  const a = ANCHOR[sceneIndex];

  return (
    // Letterbox rail — brand background fills any viewport; the 9:16 stage is centered.
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-cream-deep">
      <div
        className="relative overflow-hidden"
        style={{
          height: '100vh',
          width: 'min(56.25vh, 100vw)',
          aspectRatio: '9 / 16',
        }}
      >
        {/* ---- Persistent background: cream, floods to peach on the close ---- */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: isClose
              ? 'linear-gradient(165deg, #f6c6a1 0%, #f0a576 55%, #ec9a63 100%)'
              : 'linear-gradient(170deg, #fdfaf5 0%, #fbf7f2 55%, #f3ebe0 100%)',
          }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* grain warmth */}
        <div className="ff-grain absolute inset-0 opacity-60" />

        {/* drifting soft glow blobs (midground, always alive) */}
        <motion.div
          className="absolute rounded-full blur-3xl"
          style={{
            width: '60vh',
            height: '60vh',
            background:
              'radial-gradient(circle, rgba(58,143,136,0.16), transparent 70%)',
          }}
          animate={{
            x: ['-20%', '30%', '-10%'],
            y: ['-10%', '40%', '10%'],
            opacity: isClose ? 0.2 : 0.9,
          }}
          transition={{
            x: { duration: 22, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: 26, repeat: Infinity, ease: 'easeInOut' },
            opacity: { duration: 1.2 },
          }}
        />
        <motion.div
          className="absolute right-0 bottom-0 rounded-full blur-3xl"
          style={{
            width: '52vh',
            height: '52vh',
            background:
              'radial-gradient(circle, rgba(240,165,118,0.18), transparent 70%)',
          }}
          animate={{
            x: ['10%', '-30%', '5%'],
            y: ['10%', '-25%', '0%'],
            opacity: isClose ? 0 : 0.85,
          }}
          transition={{
            x: { duration: 28, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: 24, repeat: Infinity, ease: 'easeInOut' },
            opacity: { duration: 1.2 },
          }}
        />

        {/* ---- Persistent bowl + rings anchor (transforms across scenes) ---- */}
        <motion.div
          className="absolute left-1/2 top-1/2 flex items-center justify-center"
          animate={{ x: '-50%', y: '-50%', scale: a.scale, opacity: a.opacity }}
          transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* per-scene vertical nudge + breathing keep subtle life at all times */}
          <motion.div
            className="relative flex items-center justify-center"
            animate={{ scale: [1, 1.03, 1], y: a.y }}
            transition={{
              scale: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
              y: { duration: 1.3, ease: [0.22, 1, 0.36, 1] },
            }}
          >
            <div
              className="absolute"
              style={{ width: '46vh', height: '46vh' }}
            >
              <Rings
                progress={RING_PROGRESS[sceneIndex]}
                size="100%"
                className="h-full w-full"
              />
            </div>
            <div style={{ width: '17vh', height: '17vh' }}>
              <BowlMark
                fill={BOWL_FILL[sceneIndex]}
                size="100%"
                className="h-full w-full"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* ---- Scene-specific foreground ---- */}
        <AnimatePresence mode="popLayout">
          {SceneComponent && <SceneComponent key={currentSceneKey} />}
        </AnimatePresence>

        <audio
          ref={audioRef}
          src={`${import.meta.env.BASE_URL}audio/bg_music.mp3`}
          preload="auto"
          autoPlay
          muted={muted}
        />
      </div>
    </div>
  );
}
