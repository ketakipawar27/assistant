import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

interface ActionResultCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  onAction?: () => void;
  actionLabel?: string;
}

export function ActionResultCard({ title, description, icon, onAction, actionLabel }: ActionResultCardProps) {
  const persona = useAppStore(s => s.persona);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "w-[320px] p-4 bg-[var(--surface)] border border-[var(--border)] shadow-xl flex gap-4",
        "rounded-[var(--panel-radius)]",
        persona === 'sudo' && "border-emerald-500/30"
      )}
    >
      <div className={cn("mt-1", persona === 'sudo' ? "text-emerald-500" : "text-[var(--accent)]")}>
        {icon || <CheckCircle2 className="w-5 h-5" />}
      </div>
      <div className="flex-1">
        <h4 className={cn("text-sm font-semibold text-[var(--text)]", persona === 'sudo' && "font-mono")}>{title}</h4>
        <p className={cn("text-xs text-[var(--muted)] mt-1", persona === 'sudo' && "font-mono")}>{description}</p>
        
        {onAction && actionLabel && (
          <button 
            onClick={onAction}
            className={cn(
              "mt-3 text-xs font-medium flex items-center gap-1 transition-colors",
              persona === 'sudo' ? "text-emerald-400 hover:text-emerald-300 font-mono" : "text-[var(--accent)] hover:text-[var(--text)]"
            )}
          >
            {actionLabel} <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
