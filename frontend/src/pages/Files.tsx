import { PageHeader } from '@/components/common/PageHeader';

export function Files() {
  return (
    <div className="h-full flex flex-col">
      <PageHeader 
        title="Files" 
        description="Manage indexed documents and knowledge base." 
      />
      
      <div className="flex-1 rounded-[var(--panel-radius)] border border-[var(--border)] bg-[var(--surface)] shadow-sm p-6 transition-all duration-300">
        <p className="text-[var(--muted)]">File explorer placeholder</p>
      </div>
    </div>
  );
}
