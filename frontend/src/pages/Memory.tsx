import { PageHeader } from '@/components/common/PageHeader';

export function Memory() {
  return (
    <div className="h-full flex flex-col">
      <PageHeader 
        title="Memory" 
        description="View and manage what the assistant remembers about you." 
      />
      
      <div className="flex-1 rounded-[var(--panel-radius)] border border-[var(--border)] bg-[var(--surface)] shadow-sm p-6 transition-all duration-300">
        <p className="text-[var(--muted)]">Memory graph placeholder</p>
      </div>
    </div>
  );
}
