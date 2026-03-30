import { motion } from 'motion/react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

type WaveformState = 'idle' | 'listening' | 'processing' | 'speaking';

export function VoiceWaveform({ state = 'idle' }: { state?: WaveformState }) {
  const persona = useAppStore(s => s.persona);
  const isSudo = persona === 'sudo';
  const isTitan = persona === 'titan';
  const isAstra = persona === 'astra';

  const numBars = isSudo ? 24 : 16;
  const [bars, setBars] = useState<number[]>(Array(numBars).fill(0.1));

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const updateBars = () => {
      setBars(prev => prev.map((_, i) => {
        // Base height based on state
        let base = 0.1;
        let variance = 0;

        if (state === 'idle') {
          // Gentle breathing
          base = 0.15;
          variance = 0.05;
        } else if (state === 'listening') {
          // Active, waiting for speech
          base = 0.3;
          variance = 0.4;
        } else if (state === 'processing') {
          // Thinking / Processing (Wave pattern)
          const time = Date.now() / 200;
          return 0.3 + Math.sin(time + i * 0.5) * 0.2;
        } else if (state === 'speaking') {
          // Assistant responding
          base = 0.4;
          variance = 0.5;
        }

        return Math.max(0.05, Math.min(1, base + (Math.random() * variance * 2 - variance)));
      }));
    };

    // Update frequency based on state and persona
    let speed = 100;
    if (state === 'idle') speed = 800;
    if (state === 'processing') speed = 50;
    if (state === 'listening') speed = isSudo ? 60 : 120;
    if (state === 'speaking') speed = isSudo ? 50 : 100;

    interval = setInterval(updateBars, speed);
    return () => clearInterval(interval);
  }, [state, numBars, isSudo]);

  return (
    <div className={cn(
      "flex items-center justify-center w-full h-full",
      isSudo ? "gap-[2px]" : "gap-1"
    )}>
      {bars.map((height, i) => {
        // Add a slight delay to Astra for a more fluid, connected feel
        const delay = isAstra && state === 'processing' ? i * 0.05 : 0;
        
        return (
          <motion.div
            key={i}
            animate={{ 
              height: `${height * 100}%`,
              opacity: state === 'idle' ? 0.5 : 1
            }}
            transition={{ 
              type: (isAstra || state === 'idle') ? 'tween' : 'spring', 
              bounce: 0, 
              duration: state === 'idle' ? 0.8 : (isAstra ? 0.2 : 0.15),
              ease: state === 'idle' ? 'easeInOut' : 'linear',
              delay
            }}
            className={cn(
              "w-1.5 transition-colors duration-500",
              isTitan && "bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)] rounded-full",
              isAstra && "bg-purple-400 shadow-[0_0_16px_rgba(192,132,252,0.8)] rounded-full",
              isSudo && "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] rounded-none w-2",
              
              // State-specific color overrides
              state === 'processing' && isTitan && "bg-blue-400",
              state === 'processing' && isAstra && "bg-fuchsia-400",
              state === 'processing' && isSudo && "bg-emerald-400"
            )}
          />
        );
      })}
    </div>
  );
}
