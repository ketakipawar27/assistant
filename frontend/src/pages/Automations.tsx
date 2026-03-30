import { PageHeader } from '@/components/common/PageHeader';

export function Automations() {
  return (
    <div className="h-full flex flex-col">
      <PageHeader 
        title="Automations" 
        description="Manage your automated workflows." 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-[var(--panel-radius)] border border-[var(--border)] bg-[var(--surface)] shadow-sm transition-all duration-300">
          <h3 className="font-semibold mb-2">Morning Routine</h3>
          <p className="text-sm text-[var(--muted)]">Runs at 7:00 AM daily.</p>
        </div>
        <div className="p-6 rounded-[var(--panel-radius)] border border-[var(--border)] bg-[var(--surface)] shadow-sm border-dashed flex items-center justify-center cursor-pointer hover:bg-[var(--border)]/30 transition-all duration-300">
          <p className="text-sm font-medium text-[var(--accent)]">+ Create Automation</p>
        </div>
      </div>
    </div>
  );
}
