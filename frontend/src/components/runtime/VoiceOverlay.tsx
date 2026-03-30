import { motion } from 'motion/react';
import { AssistantOrb, AssistantState } from './AssistantOrb';
import { X, Square } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

interface VoiceOverlayProps {
  state: AssistantState;
  transcript?: string;
  taskPreview?: string;
  onClose?: () => void;
  onStop?: () => void;
}

export function VoiceOverlay({ state, transcript, taskPreview, onClose, onStop }: VoiceOverlayProps) {
  const persona = useAppStore(s => s.persona);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "w-[400px] p-6 bg-[var(--surface)]/90 backdrop-blur-xl border border-[var(--border)] shadow-2xl flex flex-col items-center text-center relative",
        "rounded-[var(--panel-radius)]",
        persona === 'sudo' && "border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.15)]"
      )}
    >
      <div className="absolute top-4 right-4 flex gap-2">
        <button onClick={onStop} className="p-1.5 text-[var(--muted)] hover:text-red-400 transition-colors" title="Stop">
          <Square className="w-4 h-4 fill-current" />
        </button>
        <button onClick={onClose} className="p-1.5 text-[var(--muted)] hover:text-[var(--text)] transition-colors" title="Close">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="my-6">
        <AssistantOrb state={state} size="lg" />
      </div>

      <div className={cn(
        "text-sm font-medium uppercase tracking-widest mb-4",
        state === 'failed' ? "text-red-400" : "text-[var(--accent)]",
        persona === 'sudo' && "font-mono"
      )}>
        {state}
      </div>

      {transcript && (
        <div className={cn(
          "text-lg font-medium text-[var(--text)] mb-4 min-h-[60px]",
          persona === 'sudo' && "font-mono text-sm"
        )}>
          "{transcript}"
        </div>
      )}

      {taskPreview && (
        <div className={cn(
          "w-full p-3 bg-[var(--bg)] border border-[var(--border)] rounded-[calc(var(--panel-radius)-4px)] text-sm text-[var(--muted)]",
          persona === 'sudo' && "font-mono text-xs"
        )}>
          {taskPreview}
        </div>
      )}
    </motion.div>
  );
}
