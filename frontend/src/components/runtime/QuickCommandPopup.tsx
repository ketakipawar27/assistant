import { Search, Mic, Command } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export function QuickCommandPopup() {
  const persona = useAppStore(s => s.persona);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "w-[600px] bg-[var(--surface)] border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col",
        "rounded-[var(--panel-radius)]",
        persona === 'sudo' && "border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
      )}
    >
      <div className="flex items-center px-4 py-3 border-b border-[var(--border)]">
        {persona === 'sudo' ? <span className="text-emerald-500 mr-3 font-mono">{'>'}</span> : <Search className="w-5 h-5 text-[var(--muted)] mr-3" />}
        <input 
          type="text" 
          placeholder={persona === 'sudo' ? "Enter command..." : "What do you need?"}
          className={cn(
            "flex-1 bg-transparent border-none outline-none text-[var(--text)] placeholder:text-[var(--muted)]",
            persona === 'sudo' && "font-mono"
          )}
          autoFocus
        />
        <button className="p-1.5 rounded-md hover:bg-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] transition-colors">
          <Mic className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-2">
        <div className={cn("px-3 py-2 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider", persona === 'sudo' && "font-mono")}>
          Suggested Actions
        </div>
        <div className="space-y-1">
          {['Summarize recent emails', 'Draft weekly report', 'System diagnostics'].map((action, i) => (
            <button key={i} className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 rounded-[calc(var(--panel-radius)-4px)] text-sm text-left transition-colors",
              "hover:bg-[var(--border)] hover:text-[var(--accent)]",
              persona === 'sudo' && "font-mono text-xs"
            )}>
              <span className="flex items-center gap-3">
                <Command className="w-4 h-4 opacity-50" />
                {action}
              </span>
              <span className="text-[var(--muted)] text-xs opacity-50">↵</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
