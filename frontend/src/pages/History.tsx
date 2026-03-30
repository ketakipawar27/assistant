import { PageHeader } from '@/components/common/PageHeader';

export function History() {
  return (
    <div className="h-full flex flex-col">
      <PageHeader 
        title="History" 
        description="Review past interactions and sessions." 
      />
      
      <div className="flex-1 rounded-[var(--panel-radius)] border border-[var(--border)] bg-[var(--surface)] shadow-sm p-6 transition-all duration-300">
        <p className="text-[var(--muted)]">Interaction history placeholder</p>
      </div>
    </div>
  );
}
