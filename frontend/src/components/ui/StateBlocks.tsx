import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { Loader2, AlertTriangle, RefreshCcw, ExternalLink, TerminalSquare, BrainCircuit, XCircle, FileText, Zap, Clock, HardDrive, Inbox } from 'lucide-react';

interface StateBlockProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ title, description, icon, action, secondaryAction, className }: StateBlockProps) {
  const persona = useAppStore(s => s.persona);
  const isSudo = persona === 'sudo';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)]/50",
        isSudo && "rounded-sm border-emerald-500/20 bg-emerald-500/5",
        className
      )}
    >
      <div className={cn(
        "w-16 h-16 rounded-full flex items-center justify-center mb-6",
        isSudo ? "bg-emerald-500/10 text-emerald-500" : "bg-[var(--bg)] text-[var(--muted)] border border-[var(--border)]"
      )}>
        {icon || (isSudo ? <TerminalSquare className="w-8 h-8" /> : <Inbox className="w-8 h-8" />)}
      </div>
      <h3 className={cn(
        "text-xl font-semibold mb-2 text-[var(--text)]",
        isSudo && "font-mono text-emerald-400"
      )}>
        {title}
      </h3>
      {description && (
        <p className={cn(
          "text-[15px] text-[var(--muted)] max-w-md mb-8",
          isSudo && "font-mono text-emerald-500/70"
        )}>
          {description}
        </p>
      )}
      
      {(action || secondaryAction) && (
        <div className="flex items-center gap-4">
          {secondaryAction && (
            <button 
              onClick={secondaryAction.onClick}
              className={cn(
                "px-5 py-2.5 text-sm font-medium rounded-xl text-[var(--text)] bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--surface)] transition-colors",
                isSudo && "rounded-sm font-mono border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400"
              )}
            >
              {secondaryAction.label}
            </button>
          )}
          {action && (
            <button 
              onClick={action.onClick}
              className={cn(
                "px-5 py-2.5 text-sm font-medium rounded-xl flex items-center gap-2 transition-all",
                isSudo 
                  ? "bg-emerald-600 text-black hover:bg-emerald-500 rounded-sm font-mono" 
                  : "bg-[var(--accent)] text-white hover:opacity-90 shadow-md"
              )}
            >
              {action.icon}
              {action.label}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

export function LoadingState({ title = "Loading...", description, className }: Partial<StateBlockProps>) {
  const persona = useAppStore(s => s.persona);
  const isSudo = persona === 'sudo';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "flex flex-col items-center justify-center text-center p-12 h-full min-h-[300px]",
        className
      )}
    >
      <Loader2 className={cn(
        "w-10 h-10 animate-spin mb-6",
        isSudo ? "text-emerald-500" : "text-[var(--accent)]"
      )} />
      <h3 className={cn(
        "text-lg font-medium text-[var(--text)]",
        isSudo && "font-mono text-emerald-400"
      )}>
        {title}
      </h3>
      {description && (
        <p className={cn(
          "text-sm text-[var(--muted)] mt-2",
          isSudo && "font-mono text-emerald-500/70"
        )}>
          {description}
        </p>
      )}
    </motion.div>
  );
}

export function ErrorState({ title = "Something went wrong", description, action, className }: StateBlockProps) {
  const persona = useAppStore(s => s.persona);
  const isSudo = persona === 'sudo';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-red-500/20 bg-red-500/5",
        isSudo && "rounded-sm font-mono",
        className
      )}
    >
      <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-5">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-red-500 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-[15px] text-red-400/80 max-w-md mb-6">
          {description}
        </p>
      )}
      
      {action && (
        <button 
          onClick={action.onClick}
          className={cn(
            "px-5 py-2.5 text-sm font-medium rounded-xl flex items-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 transition-colors",
            isSudo && "rounded-sm"
          )}
        >
          {action.icon || <RefreshCcw className="w-4 h-4" />}
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
