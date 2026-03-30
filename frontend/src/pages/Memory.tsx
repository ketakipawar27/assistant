import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/ui/StateBlocks';
import { BrainCircuit, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export function Memory() {
  const persona = useAppStore(s => s.persona);

  return (
    <div className="h-full flex flex-col">
      <PageHeader 
        title="Memory" 
        description="View and manage what the assistant remembers about you." 
      />
      
      <div className="flex-1 rounded-[var(--panel-radius)] border border-[var(--border)] bg-[var(--surface)] shadow-sm p-6 transition-all duration-300 flex items-center justify-center">
        <EmptyState 
          title="No Memories Yet"
          description="I haven't learned anything about your preferences or context yet. Chat with me to start building a personalized memory graph."
          icon={<BrainCircuit className="w-8 h-8" />}
          action={{
            label: "Learn About Memory",
            onClick: () => {},
            icon: <Sparkles className="w-4 h-4" />
          }}
        />
      </div>
    </div>
  );
}
