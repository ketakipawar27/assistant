import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/ui/StateBlocks';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { Clock, CheckCircle2, XCircle, Search, Filter, RotateCcw, ExternalLink } from 'lucide-react';
import { useState } from 'react';

export function History() {
  const persona = useAppStore(s => s.persona);
  const isSudo = persona === 'sudo';
  const [hasHistory, setHasHistory] = useState(true);

  const historyItems = [
    { id: 1, type: 'command', text: 'Summarize Downloads folder', status: 'success', time: '10 mins ago', details: 'Found 12 files, generated 3 paragraph summary.' },
    { id: 2, type: 'voice', text: 'Turn on Do Not Disturb', status: 'success', time: '2 hours ago', details: 'System focus mode enabled.' },
    { id: 3, type: 'automation', text: 'Morning Briefing', status: 'failed', time: 'Yesterday, 8:00 AM', details: 'Failed to connect to Calendar API. Network timeout.' },
    { id: 4, type: 'command', text: 'Find presentation from last week', status: 'success', time: 'Yesterday, 3:45 PM', details: 'Opened "Q3_Roadmap.pptx"' },
  ];

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <PageHeader 
          title="Action History" 
          description="Review past commands, voice interactions, and automated tasks." 
        />
        
        {hasHistory && (
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]",
              isSudo && "rounded-sm border-emerald-500/30 bg-emerald-500/5"
            )}>
              <Search className="w-4 h-4 text-[var(--muted)]" />
              <input 
                type="text" 
                placeholder="Search history..." 
                className={cn(
                  "bg-transparent border-none outline-none text-sm w-32 sm:w-48 text-[var(--text)] placeholder-[var(--muted)]",
                  isSudo && "font-mono"
                )}
              />
            </div>
            <button className={cn(
              "p-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] transition-colors",
              isSudo && "rounded-sm border-emerald-500/30 hover:text-emerald-400 hover:bg-emerald-500/10"
            )}>
              <Filter className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      {!hasHistory ? (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState 
            title="No History Yet"
            description="Your past commands, voice interactions, and completed tasks will appear here."
            icon={<Clock className="w-8 h-8" />}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 animate-in fade-in duration-500">
          {historyItems.map((item, index) => (
            <div key={item.id} className={cn(
              "p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/50 shadow-sm transition-all hover:border-[var(--muted)] flex flex-col sm:flex-row sm:items-center justify-between gap-4",
              isSudo && "rounded-sm border-emerald-500/20 hover:border-emerald-500/50"
            )}>
              <div className="flex items-start gap-4">
                <div className={cn(
                  "mt-1",
                  item.status === 'success' ? (isSudo ? "text-emerald-500" : "text-green-500") : "text-red-500"
                )}>
                  {item.status === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-md border font-medium uppercase tracking-wider",
                      item.type === 'voice' ? "bg-purple-500/10 text-purple-500 border-purple-500/20" :
                      item.type === 'automation' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                      "bg-[var(--bg)] text-[var(--muted)] border-[var(--border)]",
                      isSudo && "rounded-sm font-mono"
                    )}>
                      {item.type}
                    </span>
                    <span className={cn("text-xs text-[var(--muted)]", isSudo && "font-mono")}>{item.time}</span>
                  </div>
                  <h3 className={cn("font-medium text-[var(--text)] mb-1", isSudo && "font-mono text-emerald-50")}>"{item.text}"</h3>
                  <p className={cn(
                    "text-sm",
                    item.status === 'failed' ? "text-red-400/80" : "text-[var(--muted)]",
                    isSudo && "font-mono"
                  )}>
                    {item.details}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 self-end sm:self-center">
                {item.status === 'failed' && (
                  <button className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface)] transition-colors",
                    isSudo && "rounded-sm font-mono border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400"
                  )}>
                    <RotateCcw className="w-3.5 h-3.5" />
                    Retry
                  </button>
                )}
                <button className={cn(
                  "p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors",
                  isSudo && "rounded-sm hover:text-emerald-400 hover:bg-emerald-500/10"
                )}>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
