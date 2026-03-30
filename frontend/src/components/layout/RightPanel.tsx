import { Activity, Cpu, Database, Network } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

export function RightPanel() {
  const persona = useAppStore((state) => state.persona);

  const getProgressColor = () => {
    if (persona === 'titan') return "bg-blue-500";
    if (persona === 'astra') return "bg-purple-500";
    if (persona === 'sudo') return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]";
    return "";
  };

  return (
    <aside className="w-72 flex-shrink-0 flex flex-col h-full border-l border-[var(--border)] bg-[var(--surface)] transition-colors duration-300">
      <div className="p-6 border-b border-[var(--border)]">
        <h3 className={cn(
          "text-sm font-semibold tracking-wide text-[var(--muted)] uppercase",
          persona === 'sudo' && "font-mono text-emerald-500/70"
        )}>
          System Status
        </h3>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* CPU Usage */}
        <div className="space-y-2">
          <div className={cn(
            "flex items-center justify-between text-xs font-medium",
            persona === 'sudo' && "font-mono"
          )}>
            <span className="flex items-center gap-2 text-[var(--muted)]">
              <Cpu className="w-3.5 h-3.5" />
              Core Processing
            </span>
            <span className="text-[var(--accent)]">14%</span>
          </div>
          <div className="h-1.5 w-full bg-[var(--border)] rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-1000",
                getProgressColor()
              )} 
              style={{ width: '14%' }} 
            />
          </div>
        </div>

        {/* Memory Usage */}
        <div className="space-y-2">
          <div className={cn(
            "flex items-center justify-between text-xs font-medium",
            persona === 'sudo' && "font-mono"
          )}>
            <span className="flex items-center gap-2 text-[var(--muted)]">
              <Database className="w-3.5 h-3.5" />
              Memory Allocation
            </span>
            <span className="text-[var(--accent)]">3.2 GB</span>
          </div>
          <div className="h-1.5 w-full bg-[var(--border)] rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-1000",
                getProgressColor()
              )} 
              style={{ width: '45%' }} 
            />
          </div>
        </div>

        {/* Network */}
        <div className="space-y-2">
          <div className={cn(
            "flex items-center justify-between text-xs font-medium",
            persona === 'sudo' && "font-mono"
          )}>
            <span className="flex items-center gap-2 text-[var(--muted)]">
              <Network className="w-3.5 h-3.5" />
              Network Latency
            </span>
            <span className="text-[var(--accent)]">24ms</span>
          </div>
          <div className="h-1.5 w-full bg-[var(--border)] rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-1000",
                getProgressColor()
              )} 
              style={{ width: '8%' }} 
            />
          </div>
        </div>

        {/* Active Processes */}
        <div className="pt-6 border-t border-[var(--border)]">
          <h4 className={cn(
            "text-xs font-semibold text-[var(--muted)] uppercase mb-4 flex items-center gap-2",
            persona === 'sudo' && "font-mono text-emerald-500/70"
          )}>
            <Activity className="w-3.5 h-3.5" />
            Active Processes
          </h4>
          <ul className={cn(
            "space-y-3",
            persona === 'sudo' && "font-mono"
          )}>
            <li className="flex items-center justify-between text-xs">
              <span className="text-[var(--text)]">Background Sync</span>
              <span className="text-green-500">Active</span>
            </li>
            <li className="flex items-center justify-between text-xs">
              <span className="text-[var(--text)]">Voice Recognition</span>
              <span className="text-[var(--muted)]">Idle</span>
            </li>
            <li className="flex items-center justify-between text-xs">
              <span className="text-[var(--text)]">Context Indexing</span>
              <span className="text-[var(--accent)]">Running</span>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
