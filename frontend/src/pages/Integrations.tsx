import { PageHeader } from '@/components/common/PageHeader';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { CheckCircle2, Plus, ExternalLink, ShieldAlert } from 'lucide-react';

const INTEGRATIONS = [
  { id: 'google', name: 'Google Workspace', status: 'connected', icon: 'G', description: 'Access Docs, Sheets, and Calendar.' },
  { id: 'notion', name: 'Notion', status: 'disconnected', icon: 'N', description: 'Read and write to Notion databases.' },
  { id: 'github', name: 'GitHub', status: 'disconnected', icon: 'GH', description: 'Manage repositories and pull requests.' },
  { id: 'slack', name: 'Slack', status: 'connected', icon: 'S', description: 'Send messages and read channel history.' },
  { id: 'linear', name: 'Linear', status: 'disconnected', icon: 'L', description: 'Create and update issues.' },
  { id: 'figma', name: 'Figma', status: 'disconnected', icon: 'F', description: 'Inspect designs and extract assets.' },
];

export function Integrations() {
  const persona = useAppStore(s => s.persona);
  const isSudo = persona === 'sudo';

  return (
    <div className="h-full flex flex-col">
      <PageHeader 
        title="Integrations" 
        description="Connect external services and APIs to expand capabilities." 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {INTEGRATIONS.map((integration) => (
          <div 
            key={integration.id}
            className={cn(
              "p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm flex flex-col gap-4 transition-all duration-300 hover:border-[var(--accent)]/50 hover:shadow-md",
              isSudo && "rounded-sm border-emerald-500/20 hover:border-emerald-500/50"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg bg-[var(--bg)] border border-[var(--border)]",
                  isSudo && "rounded-sm border-emerald-500/30 text-emerald-400 font-mono"
                )}>
                  {integration.icon}
                </div>
                <div>
                  <h3 className={cn(
                    "font-medium text-[var(--text)]",
                    isSudo && "font-mono text-emerald-400"
                  )}>{integration.name}</h3>
                  <p className="text-xs text-[var(--muted)] mt-0.5">{integration.description}</p>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-[var(--border)] flex items-center justify-between">
              {integration.status === 'connected' ? (
                <>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-500">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Connected
                  </div>
                  <button className={cn(
                    "text-xs px-3 py-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors",
                    isSudo && "rounded-sm hover:text-red-400 hover:bg-red-500/10"
                  )}>
                    Configure
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--muted)]">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Requires Auth
                  </div>
                  <button className={cn(
                    "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[var(--text)] text-[var(--bg)] hover:opacity-90 transition-opacity font-medium",
                    isSudo && "rounded-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                  )}>
                    <Plus className="w-3.5 h-3.5" />
                    Connect
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
