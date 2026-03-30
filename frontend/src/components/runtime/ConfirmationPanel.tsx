import { motion } from 'motion/react';
import { AlertTriangle, Check, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

interface ConfirmationPanelProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function ConfirmationPanel({ title, message, onConfirm, onCancel, danger = false }: ConfirmationPanelProps) {
  const persona = useAppStore(s => s.persona);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "w-[380px] p-5 bg-[var(--surface)]/95 backdrop-blur-xl border shadow-2xl flex flex-col gap-4",
        "rounded-[var(--panel-radius)]",
        danger ? "border-red-500/50" : "border-[var(--border)]",
        persona === 'sudo' && "border-emerald-500/30"
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          "p-2 rounded-full",
          danger ? "bg-red-500/10 text-red-500" : "bg-[var(--accent)]/10 text-[var(--accent)]",
          persona === 'sudo' && "rounded-sm border border-current"
        )}>
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className={cn("text-base font-semibold text-[var(--text)]", persona === 'sudo' && "font-mono")}>{title}</h3>
          <p className={cn("text-sm text-[var(--muted)] mt-1 leading-relaxed", persona === 'sudo' && "font-mono text-xs")}>{message}</p>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-2">
        <button 
          onClick={onCancel}
          className={cn(
            "px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] transition-colors rounded-[calc(var(--panel-radius)-4px)]",
            persona === 'sudo' && "font-mono text-xs border border-[var(--border)] hover:border-emerald-500/50"
          )}
        >
          Cancel
        </button>
        <button 
          onClick={onConfirm}
          className={cn(
            "px-4 py-2 text-sm font-medium text-white transition-colors rounded-[calc(var(--panel-radius)-4px)] flex items-center gap-2",
            danger ? "bg-red-500 hover:bg-red-600" : "bg-[var(--accent)] hover:opacity-90",
            persona === 'sudo' && "font-mono text-xs bg-emerald-600 hover:bg-emerald-500 text-black font-bold"
          )}
        >
          <Check className="w-4 h-4" /> Confirm
        </button>
      </div>
    </motion.div>
  );
}
