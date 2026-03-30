import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/ui/StateBlocks';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { Zap, Clock, Play, MoreVertical, Plus } from 'lucide-react';
import { useState } from 'react';

export function Automations() {
  const persona = useAppStore(s => s.persona);
  const isSudo = persona === 'sudo';
  const [automations, setAutomations] = useState<any[]>([]); // Start empty to show empty state

  const handleCreate = () => {
    // Mock adding an automation
    setAutomations([
      { id: 1, name: 'Morning Briefing', trigger: 'Daily at 8:00 AM', enabled: true, lastRun: 'Today, 8:00 AM' },
      { id: 2, name: 'Clean Downloads', trigger: 'Every Friday at 5:00 PM', enabled: false, lastRun: 'Last Friday' },
    ]);
  };

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-2">
        <PageHeader 
          title="Automations" 
          description="Manage background tasks and scheduled workflows." 
        />
        {automations.length > 0 && (
          <button 
            onClick={handleCreate}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-xl flex items-center gap-2 transition-all",
              isSudo 
                ? "bg-emerald-600 text-black hover:bg-emerald-500 rounded-sm font-mono" 
                : "bg-[var(--accent)] text-white hover:opacity-90 shadow-md"
            )}
          >
            <Plus className="w-4 h-4" />
            New Automation
          </button>
        )}
      </div>
      
      {automations.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState 
            title="No Automations Yet"
            description="Create background tasks that run on a schedule or when specific events happen on your system."
            icon={<Zap className="w-8 h-8" />}
            action={{
              label: "Create Automation",
              onClick: handleCreate,
              icon: <Plus className="w-4 h-4" />
            }}
            secondaryAction={{
              label: "Browse Templates",
              onClick: () => {}
            }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 animate-in fade-in duration-500">
          {automations.map(auto => (
            <div key={auto.id} className={cn(
              "p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/50 shadow-sm transition-all duration-300 hover:border-[var(--muted)]",
              isSudo && "rounded-sm border-emerald-500/20 hover:border-emerald-500/50"
            )}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    auto.enabled 
                      ? isSudo ? "bg-emerald-500/10 text-emerald-400" : "bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "bg-[var(--bg)] text-[var(--muted)] border border-[var(--border)]",
                    isSudo && "rounded-sm"
                  )}>
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={cn("font-semibold text-[var(--text)]", isSudo && "font-mono text-emerald-50")}>{auto.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span className={isSudo ? "font-mono" : ""}>{auto.trigger}</span>
                    </div>
                  </div>
                </div>
                <button className="p-1.5 text-[var(--muted)] hover:text-[var(--text)] rounded-lg hover:bg-[var(--bg)] transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                <div className="text-xs text-[var(--muted)]">
                  Last run: <span className={cn("text-[var(--text)]", isSudo && "font-mono text-emerald-400/80")}>{auto.lastRun}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className={cn(
                    "p-2 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors",
                    isSudo && "rounded-sm hover:text-emerald-400 hover:bg-emerald-500/10"
                  )}>
                    <Play className="w-4 h-4" />
                  </button>
                  <div className={cn(
                    "w-9 h-5 rounded-full relative cursor-pointer transition-colors duration-300",
                    auto.enabled 
                      ? isSudo ? "bg-emerald-500" : "bg-[var(--accent)]" 
                      : "bg-[var(--border)]",
                    isSudo && "rounded-sm"
                  )}>
                    <div className={cn(
                      "absolute top-1 w-3 h-3 bg-white transition-transform duration-300 shadow-sm",
                      auto.enabled ? "translate-x-5" : "translate-x-1",
                      isSudo ? "rounded-sm" : "rounded-full"
                    )} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
