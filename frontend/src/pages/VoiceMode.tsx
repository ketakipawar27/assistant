import { PageHeader } from '@/components/common/PageHeader';

export function VoiceMode() {
  return (
    <div className="h-full flex flex-col">
      <PageHeader 
        title="Voice Mode" 
        description="Hands-free interaction." 
      />
      
      <div className="flex-1 rounded-[var(--panel-radius)] border border-[var(--border)] bg-[var(--surface)] shadow-sm flex items-center justify-center transition-all duration-300">
        <div className="text-center space-y-4">
          <div className="w-32 h-32 rounded-full border-4 border-[var(--accent)]/20 mx-auto flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-[var(--accent)]/10 animate-pulse" />
          </div>
          <p className="text-[var(--muted)]">Voice interface placeholder</p>
        </div>
      </div>
    </div>
  );
}
