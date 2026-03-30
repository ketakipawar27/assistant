import { motion } from 'motion/react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

interface TaskProgressPanelProps {
  taskName: string;
  progress: number; // 0 to 100
  status: 'running' | 'completed' | 'failed';
  details?: string;
}

export function TaskProgressPanel({ taskName, progress, status, details }: TaskProgressPanelProps) {
  const persona = useAppStore(s => s.persona);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "w-[280px] p-4 bg-[var(--surface)] border border-[var(--border)] shadow-lg flex flex-col gap-3",
        "rounded-[var(--panel-radius)]",
        persona === 'sudo' && "border-emerald-500/20"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status === 'running' && <Loader2 className="w-4 h-4 text-[var(--accent)] animate-spin" />}
          {status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          {status === 'failed' && <XCircle className="w-4 h-4 text-red-500" />}
          <span className={cn("text-sm font-medium text-[var(--text)] truncate max-w-[180px]", persona === 'sudo' && "font-mono")}>
            {taskName}
          </span>
        </div>
        <span className={cn("text-xs font-medium text-[var(--muted)]", persona === 'sudo' && "font-mono")}>
          {progress}%
        </span>
      </div>

      <div className="h-1.5 w-full bg-[var(--bg)] rounded-full overflow-hidden">
        <motion.div 
          className={cn(
            "h-full rounded-full",
            status === 'failed' ? "bg-red-500" : "bg-[var(--accent)]",
            persona === 'sudo' && status !== 'failed' && "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {details && (
        <p className={cn("text-xs text-[var(--muted)] truncate", persona === 'sudo' && "font-mono text-[10px]")}>
          {details}
        </p>
      )}
    </motion.div>
  );
}
