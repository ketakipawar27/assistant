import { PageHeader } from '@/components/common/PageHeader';

export function Integrations() {
  return (
    <div className="h-full flex flex-col">
      <PageHeader 
        title="Integrations" 
        description="Connect external services and APIs." 
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-[var(--panel-radius)] border border-[var(--border)] bg-[var(--surface)] shadow-sm flex items-center justify-between transition-all duration-300">
          <span className="font-medium">Google Workspace</span>
          <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500">Connected</span>
        </div>
        <div className="p-6 rounded-[var(--panel-radius)] border border-[var(--border)] bg-[var(--surface)] shadow-sm flex items-center justify-between transition-all duration-300">
          <span className="font-medium">Notion</span>
          <button className="text-xs px-3 py-1.5 rounded-[var(--panel-radius)] bg-[var(--border)] hover:bg-[var(--border)]/80 transition-colors">Connect</button>
        </div>
      </div>
    </div>
  );
}
