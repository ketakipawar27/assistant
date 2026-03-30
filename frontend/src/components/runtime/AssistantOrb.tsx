import { motion } from 'motion/react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { BrainCircuit, TerminalSquare } from 'lucide-react';

export type AssistantState = 'idle' | 'listening' | 'thinking' | 'executing' | 'speaking' | 'failed' | 'completed' | 'confirming';

interface AssistantOrbProps {
  state?: AssistantState;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  forceCircle?: boolean;
}

export function AssistantOrb({ state = 'idle', size = 'md', className, forceCircle }: AssistantOrbProps) {
  const persona = useAppStore((s) => s.persona);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const getPersonaStyles = () => {
    if (persona === 'titan') return 'bg-blue-600 shadow-[0_0_30px_rgba(59,130,246,0.5)]';
    if (persona === 'astra') return 'bg-purple-600 shadow-[0_0_30px_rgba(192,132,252,0.5)] rounded-full';
    if (persona === 'sudo') return `bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.4)] ${forceCircle ? '' : 'rounded-sm'} border border-emerald-400/50`;
    return '';
  };

  const getAnimationProps = () => {
    switch (state) {
      case 'listening':
        return { scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 1.5 } };
      case 'thinking':
        return { rotate: [0, 180, 360], transition: { repeat: Infinity, duration: 2, ease: "linear" } };
      case 'speaking':
        return { scale: [1, 1.2, 1.1, 1.3, 1], transition: { repeat: Infinity, duration: 0.8 } };
      case 'executing':
        return { y: [0, -5, 0], transition: { repeat: Infinity, duration: 1 } };
      case 'failed':
        return { x: [-5, 5, -5, 5, 0], transition: { duration: 0.4 } };
      case 'completed':
        return { scale: [1, 1.2, 1], transition: { duration: 0.5 } };
      case 'confirming':
        return { scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8], transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" } };
      default: // idle
        return { y: [0, -2, 0], transition: { repeat: Infinity, duration: 3, ease: "easeInOut" } };
    }
  };

  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      className={cn(
        "flex items-center justify-center cursor-pointer z-50",
        sizeClasses[size],
        getPersonaStyles(),
        forceCircle ? 'rounded-full' : (persona !== 'sudo' && persona !== 'astra' ? 'rounded-xl' : ''),
        className
      )}
      animate={getAnimationProps()}
    >
      {persona === 'sudo' ? (
        <TerminalSquare className="w-[55%] h-[55%] text-emerald-50" />
      ) : (
        <BrainCircuit className="w-[55%] h-[55%] text-white" />
      )}
    </motion.div>
  );
}
