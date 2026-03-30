import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Info, 
  FileText, 
  Terminal, 
  Loader2,
  ChevronRight,
  AlertTriangle,
  Play
} from 'lucide-react';
import { motion } from 'motion/react';

interface ToolExecutionCardProps {
  name: string;
  status: 'running' | 'completed' | 'failed';
  details?: string;
  isLast?: boolean;
}

export function ToolExecutionCard({ name, status, details, isLast }: ToolExecutionCardProps) {
  const persona = useAppStore(s => s.persona);
  const isSudo = persona === 'sudo';

  return (
    <div className="relative flex items-start gap-3 group mt-2">
      {/* Timeline Connector */}
      {!isLast && (
        <div className={cn(
          "absolute left-[11px] top-6 bottom-[-16px] w-px",
          isSudo ? "bg-emerald-500/20" : "bg-[var(--border)]"
        )} />
      )}

      {/* Status Icon */}
      <div className={cn(
        "relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
        status === 'running' ? "bg-amber-500/10 text-amber-500" :
        status === 'completed' ? (isSudo ? "bg-emerald-500/10 text-emerald-500" : "bg-emerald-500/10 text-emerald-500") :
        "bg-red-500/10 text-red-500",
        isSudo && "rounded-sm"
      )}>
        {status === 'running' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
         status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
         <XCircle className="w-3.5 h-3.5" />}
      </div>

      {/* Content */}
      <div className={cn(
        "flex-1 px-3 py-2 rounded-lg border text-sm transition-colors",
        isSudo ? "font-mono rounded-sm border-emerald-500/20 bg-emerald-500/5" : "border-[var(--border)] bg-[var(--surface)]",
        status === 'failed' && (isSudo ? "border-red-500/30 bg-red-500/5" : "border-red-500/20 bg-red-500/5")
      )}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <Terminal className={cn("w-3.5 h-3.5 shrink-0", isSudo ? "text-emerald-500/70" : "text-[var(--muted)]")} />
            <span className={cn(
              "font-medium truncate",
              isSudo ? "text-emerald-400" : "text-[var(--text)]"
            )}>
              {name}
            </span>
          </div>
          <span className={cn(
            "text-[10px] uppercase tracking-wider shrink-0",
            status === 'running' ? "text-amber-500" :
            status === 'completed' ? (isSudo ? "text-emerald-500" : "text-emerald-500") :
            "text-red-500"
          )}>
            {status}
          </span>
        </div>
        {details && (
          <div className={cn(
            "mt-1 text-xs truncate",
            isSudo ? "text-emerald-500/60" : "text-[var(--muted)]"
          )}>
            {details}
          </div>
        )}
      </div>
    </div>
  );
}

interface ResultCardProps {
  title: string;
  description: string;
  iconType?: 'success' | 'error' | 'warning' | 'info';
}

export function ResultCard({ title, description, iconType = 'info' }: ResultCardProps) {
  const persona = useAppStore(s => s.persona);
  const isSudo = persona === 'sudo';

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    error: <XCircle className="w-4 h-4 text-red-500" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    info: <Info className={cn("w-4 h-4", isSudo ? "text-emerald-500" : "text-blue-500")} />
  };

  return (
    <div className="relative flex items-start gap-3 mt-2">
      {/* End of timeline dot */}
      <div className={cn(
        "relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1",
        isSudo ? "bg-emerald-500/20 rounded-sm" : "bg-[var(--surface)] border border-[var(--border)]"
      )}>
        <div className={cn("w-2 h-2 rounded-full", isSudo ? "bg-emerald-500" : "bg-[var(--accent)]")} />
      </div>

      <div className={cn(
        "flex-1 p-3 rounded-xl border",
        isSudo ? "font-mono rounded-sm border-emerald-500/30 bg-emerald-500/10" : "border-[var(--border)] bg-[var(--surface)]"
      )}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">{icons[iconType]}</div>
          <div>
            <h4 className={cn("text-sm font-medium", isSudo ? "text-emerald-400" : "text-[var(--text)]")}>{title}</h4>
            <p className={cn("text-xs mt-1 leading-relaxed", isSudo ? "text-emerald-50/70" : "text-[var(--muted)]")}>{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FileSummaryCardProps {
  files: { name: string; size: string }[];
  summary: string;
}

export function FileSummaryCard({ files, summary }: FileSummaryCardProps) {
  const persona = useAppStore(s => s.persona);
  const isSudo = persona === 'sudo';

  return (
    <div className="relative flex items-start gap-3 mt-2">
      <div className={cn(
        "relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1",
        isSudo ? "bg-emerald-500/20 rounded-sm" : "bg-[var(--surface)] border border-[var(--border)]"
      )}>
        <FileText className={cn("w-3 h-3", isSudo ? "text-emerald-500" : "text-[var(--accent)]")} />
      </div>

      <div className={cn(
        "flex-1 p-4 rounded-xl border space-y-3",
        isSudo ? "font-mono rounded-sm border-emerald-500/30 bg-emerald-500/5" : "border-[var(--border)] bg-[var(--surface)]"
      )}>
        <div className="space-y-1.5">
          {files.map((f, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileText className={cn("w-3.5 h-3.5 shrink-0", isSudo ? "text-emerald-500/50" : "text-[var(--muted)]")} />
                <span className={cn("truncate", isSudo ? "text-emerald-400" : "text-[var(--text)]")}>{f.name}</span>
              </div>
              <span className={cn("shrink-0", isSudo ? "text-emerald-500/50" : "text-[var(--muted)]")}>{f.size}</span>
            </div>
          ))}
        </div>
        <div className={cn(
          "pt-3 border-t text-sm leading-relaxed",
          isSudo ? "border-emerald-500/20 text-emerald-50/80" : "border-[var(--border)] text-[var(--text)]"
        )}>
          {summary}
        </div>
      </div>
    </div>
  );
}

interface ConfirmationRequestCardProps {
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function ConfirmationRequestCard({ title, message, onConfirm, onCancel }: ConfirmationRequestCardProps) {
  const persona = useAppStore(s => s.persona);
  const isSudo = persona === 'sudo';

  return (
    <div className="relative flex items-start gap-3 mt-2">
      <div className={cn(
        "relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1",
        isSudo ? "bg-amber-500/20 rounded-sm" : "bg-amber-500/10"
      )}>
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
      </div>

      <div className={cn(
        "flex-1 p-4 rounded-xl border",
        isSudo ? "font-mono rounded-sm border-amber-500/30 bg-amber-500/5" : "border-amber-500/20 bg-amber-500/5"
      )}>
        <h4 className={cn("text-sm font-medium", isSudo ? "text-amber-400" : "text-amber-600 dark:text-amber-500")}>{title}</h4>
        <p className={cn("text-sm mt-1 mb-4", isSudo ? "text-amber-500/70" : "text-[var(--text)]")}>{message}</p>
        <div className="flex items-center gap-2">
          <button onClick={onConfirm} className={cn(
            "px-4 py-1.5 text-sm font-medium rounded-lg transition-colors",
            isSudo ? "bg-amber-500 text-black hover:bg-amber-400 rounded-sm" : "bg-amber-500 text-white hover:bg-amber-600"
          )}>
            Proceed
          </button>
          <button onClick={onCancel} className={cn(
            "px-4 py-1.5 text-sm font-medium rounded-lg border transition-colors",
            isSudo ? "border-amber-500/30 text-amber-500 hover:bg-amber-500/10 rounded-sm" : "border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface)]"
          )}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function SuggestionChips({ suggestions, onSelect }: { suggestions: string[], onSelect?: (s: string) => void }) {
  const persona = useAppStore(s => s.persona);
  const isSudo = persona === 'sudo';

  return (
    <div className="flex flex-wrap gap-2 mt-3 ml-9">
      {suggestions.map((s, i) => (
        <button
          key={i}
          onClick={() => onSelect?.(s)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
            isSudo 
              ? "font-mono rounded-sm border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50" 
              : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--accent)]"
          )}
        >
          {s}
          <ChevronRight className="w-3 h-3 opacity-50" />
        </button>
      ))}
    </div>
  );
}
