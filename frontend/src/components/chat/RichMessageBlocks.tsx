import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { Loader2, CheckCircle2, XCircle, FileText, Image as ImageIcon, AlertTriangle, Terminal, Play } from 'lucide-react';
import { motion } from 'motion/react';

// --- Tool Execution Card ---
export function ToolExecutionCard({ name, status, details }: { name: string, status: 'running' | 'completed' | 'failed', details?: string }) {
  const persona = useAppStore(s => s.persona);

  return (
    <div className={cn(
      "w-full max-w-md p-3 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--panel-radius)] flex flex-col gap-2 my-2",
      persona === 'sudo' && "border-emerald-500/20 font-mono text-sm"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status === 'running' && <Loader2 className={cn("w-4 h-4 animate-spin", persona === 'sudo' ? "text-emerald-500" : "text-[var(--accent)]")} />}
          {status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          {status === 'failed' && <XCircle className="w-4 h-4 text-red-500" />}
          <span className="font-medium text-[var(--text)] text-sm flex items-center gap-1.5">
            {persona === 'sudo' && <Terminal className="w-3 h-3 opacity-50" />}
            {name}
          </span>
        </div>
        <span className="text-xs text-[var(--muted)] uppercase tracking-wider">{status}</span>
      </div>
      {details && (
        <div className={cn(
          "text-xs text-[var(--muted)] bg-[var(--bg)] p-2 rounded-[calc(var(--panel-radius)-4px)]",
          persona === 'sudo' && "border border-[var(--border)]"
        )}>
          {details}
        </div>
      )}
    </div>
  );
}

// --- Result Card ---
export function ResultCard({ title, description, iconType = 'success' }: { title: string, description: string, iconType?: 'success' | 'error' | 'warning' | 'info' }) {
  const persona = useAppStore(s => s.persona);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    info: <FileText className={cn("w-5 h-5", persona === 'sudo' ? "text-emerald-500" : "text-[var(--accent)]")} />
  };

  return (
    <div className={cn(
      "w-full max-w-md p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--panel-radius)] flex gap-3 my-2 shadow-sm",
      persona === 'sudo' && "border-emerald-500/20 font-mono",
      iconType === 'error' && "border-red-500/30 bg-red-500/5"
    )}>
      <div className="mt-0.5 shrink-0">{icons[iconType]}</div>
      <div>
        <h4 className="text-sm font-semibold text-[var(--text)]">{title}</h4>
        <p className="text-sm text-[var(--muted)] mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// --- File Summary Card ---
export function FileSummaryCard({ files, summary }: { files: {name: string, size: string}[], summary: string }) {
  const persona = useAppStore(s => s.persona);

  return (
    <div className={cn(
      "w-full max-w-lg p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--panel-radius)] flex flex-col gap-3 my-2",
      persona === 'sudo' && "border-emerald-500/20 font-mono"
    )}>
      <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
        <FileText className={cn("w-4 h-4", persona === 'sudo' ? "text-emerald-500" : "text-[var(--accent)]")} />
        File Analysis Complete
      </div>
      
      <div className="flex flex-wrap gap-2">
        {files.map((f, i) => (
          <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-[var(--bg)] border border-[var(--border)] rounded flex-shrink-0 text-xs text-[var(--muted)]">
            <FileText className="w-3 h-3" />
            <span className="truncate max-w-[120px]">{f.name}</span>
            <span className="opacity-50">({f.size})</span>
          </div>
        ))}
      </div>

      <div className="text-sm text-[var(--text)] leading-relaxed bg-[var(--bg)] p-3 rounded-[calc(var(--panel-radius)-4px)] border border-[var(--border)]">
        {summary}
      </div>
    </div>
  );
}

// --- Confirmation Request Card ---
export function ConfirmationRequestCard({ title, message, onConfirm, onCancel }: { title: string, message: string, onConfirm?: () => void, onCancel?: () => void }) {
  const persona = useAppStore(s => s.persona);

  return (
    <div className={cn(
      "w-full max-w-md p-4 bg-[var(--surface)] border border-amber-500/30 rounded-[var(--panel-radius)] flex flex-col gap-3 my-2 shadow-sm",
      persona === 'sudo' && "font-mono"
    )}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-[var(--text)]">{title}</h4>
          <p className="text-sm text-[var(--muted)] mt-1">{message}</p>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-2">
        <button onClick={onCancel} className={cn(
          "px-3 py-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] transition-colors rounded",
          persona === 'sudo' && "border border-[var(--border)] hover:border-emerald-500/50"
        )}>
          Cancel
        </button>
        <button onClick={onConfirm} className={cn(
          "px-3 py-1.5 text-xs font-medium text-white bg-[var(--accent)] hover:opacity-90 transition-opacity rounded flex items-center gap-1.5",
          persona === 'sudo' && "bg-emerald-600 hover:bg-emerald-500 text-black font-bold"
        )}>
          <Play className="w-3 h-3 fill-current" /> Proceed
        </button>
      </div>
    </div>
  );
}

// --- Suggestion Chips ---
export function SuggestionChips({ suggestions, onSelect }: { suggestions: string[], onSelect?: (s: string) => void }) {
  const persona = useAppStore(s => s.persona);

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {suggestions.map((s, i) => (
        <button
          key={i}
          onClick={() => onSelect?.(s)}
          className={cn(
            "px-3 py-1.5 text-xs font-medium bg-[var(--surface)] border border-[var(--border)] rounded-full text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--accent)] transition-colors",
            persona === 'sudo' && "font-mono rounded-sm hover:border-emerald-500 hover:text-emerald-400"
          )}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
