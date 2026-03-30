import { useAppStore } from '@/store/useAppStore';
import { useRuntimeStore } from '@/store/useRuntimeStore';
import { cn } from '@/lib/utils';
import { BrainCircuit, TerminalSquare, MoreVertical, Settings2, Activity } from 'lucide-react';
import { AssistantOrb } from '../runtime/AssistantOrb';

export function ChatHeader() {
  const persona = useAppStore(s => s.persona);
  const assistantState = useRuntimeStore(s => s.assistantState);

  const getPersonaTitle = () => {
    if (persona === 'titan') return 'TITAN.OS';
    if (persona === 'astra') return 'Astra';
    if (persona === 'sudo') return 'root@sudo:~#';
    return 'Assistant';
  };

  const getPersonaSubtitle = () => {
    if (persona === 'titan') return 'Tactical Command Center';
    if (persona === 'astra') return 'Personal Intelligence';
    if (persona === 'sudo') return 'System Operator Console';
    return 'AI Assistant';
  };

  return (
    <header className={cn(
      "flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface)]/50 backdrop-blur-md sticky top-0 z-10",
      persona === 'sudo' && "border-emerald-500/20"
    )}>
      <div className="flex items-center gap-4">
        <div className="relative">
          <AssistantOrb state={assistantState} size="sm" />
          {assistantState !== 'idle' && (
            <span className={cn(
              "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[var(--surface)]",
              assistantState === 'failed' ? "bg-red-500" : "bg-[var(--accent)]",
              persona === 'sudo' && assistantState !== 'failed' && "bg-emerald-500"
            )} />
          )}
        </div>
        
        <div>
          <h1 className={cn(
            "text-lg font-semibold text-[var(--text)] tracking-tight flex items-center gap-2",
            persona === 'sudo' && "font-mono text-emerald-400 text-sm tracking-wider"
          )}>
            {getPersonaTitle()}
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium border",
              assistantState === 'idle' ? "bg-[var(--bg)] text-[var(--muted)] border-[var(--border)]" :
              assistantState === 'failed' ? "bg-red-500/10 text-red-500 border-red-500/20" :
              persona === 'sudo' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
              "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20"
            )}>
              {assistantState}
            </span>
          </h1>
          <p className={cn(
            "text-xs text-[var(--muted)]",
            persona === 'sudo' && "font-mono opacity-70"
          )}>
            {getPersonaSubtitle()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className={cn(
          "p-2 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] rounded-[calc(var(--panel-radius)-4px)] transition-colors",
          persona === 'sudo' && "hover:text-emerald-400 hover:bg-emerald-500/10"
        )}>
          <Activity className="w-4 h-4" />
        </button>
        <button className={cn(
          "p-2 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] rounded-[calc(var(--panel-radius)-4px)] transition-colors",
          persona === 'sudo' && "hover:text-emerald-400 hover:bg-emerald-500/10"
        )}>
          <Settings2 className="w-4 h-4" />
        </button>
        <button className={cn(
          "p-2 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] rounded-[calc(var(--panel-radius)-4px)] transition-colors",
          persona === 'sudo' && "hover:text-emerald-400 hover:bg-emerald-500/10"
        )}>
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
