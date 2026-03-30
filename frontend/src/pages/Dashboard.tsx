import { PageHeader } from '@/components/common/PageHeader';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { Activity, Zap, HardDrive, Cpu, Clock, Bell, ArrowRight } from 'lucide-react';

export function Dashboard() {
  const persona = useAppStore(s => s.persona);
  const isSudo = persona === 'sudo';

  return (
    <div className="h-full flex flex-col">
      <PageHeader 
        title={isSudo ? "SYSTEM OVERVIEW" : "Dashboard"} 
        description={isSudo ? "Real-time telemetry and system status." : "System overview and quick actions."} 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* System Health */}
        <div className={cn(
          "p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm flex flex-col gap-4 transition-all duration-300",
          isSudo && "rounded-sm border-emerald-500/20"
        )}>
          <div className="flex items-center justify-between">
            <h3 className={cn("font-medium text-[var(--text)]", isSudo && "font-mono text-emerald-400")}>System Health</h3>
            <Activity className={cn("w-4 h-4 text-[var(--muted)]", isSudo && "text-emerald-500/50")} />
          </div>
          <div className="flex items-end gap-2">
            <span className={cn("text-3xl font-light", isSudo && "font-mono text-emerald-300")}>98%</span>
            <span className={cn("text-xs text-emerald-500 font-medium mb-1", isSudo && "font-mono")}>Optimal</span>
          </div>
          <div className="w-full h-1.5 bg-[var(--bg)] rounded-full overflow-hidden">
            <div className={cn("h-full w-[98%] bg-emerald-500", isSudo && "bg-emerald-400")} />
          </div>
        </div>
        
        {/* CPU Usage */}
        <div className={cn(
          "p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm flex flex-col gap-4 transition-all duration-300",
          isSudo && "rounded-sm border-emerald-500/20"
        )}>
          <div className="flex items-center justify-between">
            <h3 className={cn("font-medium text-[var(--text)]", isSudo && "font-mono text-emerald-400")}>CPU Usage</h3>
            <Cpu className={cn("w-4 h-4 text-[var(--muted)]", isSudo && "text-emerald-500/50")} />
          </div>
          <div className="flex items-end gap-2">
            <span className={cn("text-3xl font-light", isSudo && "font-mono text-emerald-300")}>12%</span>
            <span className={cn("text-xs text-[var(--muted)] mb-1", isSudo && "font-mono text-emerald-500/50")}>Idle</span>
          </div>
          <div className="w-full h-1.5 bg-[var(--bg)] rounded-full overflow-hidden">
            <div className={cn("h-full w-[12%] bg-[var(--accent)]", isSudo && "bg-emerald-400")} />
          </div>
        </div>
        
        {/* Memory Usage */}
        <div className={cn(
          "p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm flex flex-col gap-4 transition-all duration-300",
          isSudo && "rounded-sm border-emerald-500/20"
        )}>
          <div className="flex items-center justify-between">
            <h3 className={cn("font-medium text-[var(--text)]", isSudo && "font-mono text-emerald-400")}>Memory</h3>
            <HardDrive className={cn("w-4 h-4 text-[var(--muted)]", isSudo && "text-emerald-500/50")} />
          </div>
          <div className="flex items-end gap-2">
            <span className={cn("text-3xl font-light", isSudo && "font-mono text-emerald-300")}>4.2</span>
            <span className={cn("text-xs text-[var(--muted)] mb-1", isSudo && "font-mono text-emerald-500/50")}>GB / 16 GB</span>
          </div>
          <div className="w-full h-1.5 bg-[var(--bg)] rounded-full overflow-hidden">
            <div className={cn("h-full w-[26%] bg-[var(--accent)]", isSudo && "bg-emerald-400")} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quick Actions */}
        <div className={cn(
          "p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm flex flex-col gap-4 transition-all duration-300",
          isSudo && "rounded-sm border-emerald-500/20"
        )}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={cn("font-medium text-[var(--text)]", isSudo && "font-mono text-emerald-400")}>Quick Actions</h3>
            <Zap className={cn("w-4 h-4 text-[var(--muted)]", isSudo && "text-emerald-500/50")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'New Chat', icon: <Activity className="w-4 h-4" /> },
              { label: 'Summarize Screen', icon: <HardDrive className="w-4 h-4" /> },
              { label: 'Run Automation', icon: <Cpu className="w-4 h-4" /> },
              { label: 'Settings', icon: <Clock className="w-4 h-4" /> }
            ].map((action, i) => (
              <button key={i} className={cn(
                "flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/5 transition-all text-sm text-left",
                isSudo && "rounded-sm border-emerald-500/20 font-mono text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/10"
              )}>
                <div className={cn("text-[var(--muted)]", isSudo && "text-emerald-500/70")}>{action.icon}</div>
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className={cn(
          "p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm flex flex-col gap-4 transition-all duration-300",
          isSudo && "rounded-sm border-emerald-500/20"
        )}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={cn("font-medium text-[var(--text)]", isSudo && "font-mono text-emerald-400")}>Recent Activity</h3>
            <Bell className={cn("w-4 h-4 text-[var(--muted)]", isSudo && "text-emerald-500/50")} />
          </div>
          <div className="flex flex-col gap-3">
            {[
              { title: 'Summarized 3 PDFs', time: '10 mins ago', type: 'task' },
              { title: 'System update completed', time: '1 hour ago', type: 'system' },
              { title: 'New automation created', time: '2 hours ago', type: 'user' }
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--bg)] transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    activity.type === 'task' ? "bg-blue-500" : activity.type === 'system' ? "bg-emerald-500" : "bg-purple-500"
                  )} />
                  <span className={cn("text-sm text-[var(--text)]", isSudo && "font-mono text-emerald-300")}>{activity.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn("text-xs text-[var(--muted)]", isSudo && "font-mono text-emerald-500/50")}>{activity.time}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
