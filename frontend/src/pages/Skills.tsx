import { PageHeader } from '@/components/common/PageHeader';

export function Skills() {
  return (
    <div className="h-full flex flex-col">
      <PageHeader 
        title="Skills" 
        description="Enhance your assistant's capabilities." 
      />
      
      <div className="flex-1 rounded-[var(--panel-radius)] border border-[var(--border)] bg-[var(--surface)] shadow-sm p-6 transition-all duration-300">
        <p className="text-[var(--muted)]">Skills marketplace placeholder</p>
      </div>
    </div>
  );
}
