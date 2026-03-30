import { motion } from 'motion/react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function VoiceWaveform({ isListening }: { isListening: boolean }) {
  const persona = useAppStore(s => s.persona);
  const isSudo = persona === 'sudo';
  const isTitan = persona === 'titan';
  const isAstra = persona === 'astra';

  const numBars = isSudo ? 16 : 12;
  const [bars, setBars] = useState<number[]>(Array(numBars).fill(0.2));

  useEffect(() => {
    if (!isListening) {
      setBars(Array(numBars).fill(0.2));
      return;
    }

    const interval = setInterval(() => {
      setBars(Array(numBars).fill(0).map(() => Math.random() * 0.8 + 0.2));
    }, isSudo ? 80 : isTitan ? 100 : 150); // SUDO is fast/jittery, Titan is sharp, Astra is smooth

    return () => clearInterval(interval);
  }, [isListening, numBars, isSudo, isTitan]);

  return (
    <div className={cn(
      "flex items-center justify-center h-12",
      isSudo ? "gap-1" : "gap-[3px]"
    )}>
      {bars.map((height, i) => (
        <motion.div
          key={i}
          animate={{ height: `${height * 100}%` }}
          transition={{ 
            type: isAstra ? 'tween' : 'spring', 
            bounce: 0, 
            duration: isAstra ? 0.2 : 0.1,
            ease: isAstra ? 'easeInOut' : 'linear'
          }}
          className={cn(
            "w-1.5",
            isTitan && "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] rounded-sm",
            isAstra && "bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.6)] rounded-full",
            isSudo && "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] rounded-none w-2 opacity-80"
          )}
        />
      ))}
    </div>
  );
}
