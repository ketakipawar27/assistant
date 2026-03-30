import { PageHeader } from '@/components/common/PageHeader';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

export function Settings() {
  const { persona, setPersona } = useAppStore();

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto w-full">
      <PageHeader 
        title="Settings" 
        description="Configure your assistant preferences." 
      />
      
      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-4 text-[var(--text)]">Appearance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setPersona('titan')}
              className={cn(
                "flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-300",
                persona === 'titan' 
                  ? "border-blue-500 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--muted)]"
              )}
            >
              <span className="font-medium text-lg mb-1">Titan Mode</span>
              <span className="text-sm text-[var(--muted)]">Tactical, masculine, cinematic command-center.</span>
            </button>
            
            <button
              onClick={() => setPersona('astra')}
              className={cn(
                "flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-300",
                persona === 'astra' 
                  ? "border-purple-500 bg-purple-500/5 shadow-[0_0_15px_rgba(192,132,252,0.1)]" 
                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--muted)]"
              )}
            >
              <span className="font-medium text-lg mb-1">Astra Mode</span>
              <span className="text-sm text-[var(--muted)]">Elegant, feminine, futuristic soft-glow.</span>
            </button>

            <button
              onClick={() => setPersona('sudo')}
              className={cn(
                "flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-300",
                persona === 'sudo' 
                  ? "border-emerald-500 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--muted)]"
              )}
            >
              <span className="font-mono font-medium text-lg mb-1 text-emerald-400">SUDO Mode</span>
              <span className="text-sm text-[var(--muted)]">Advanced operator, privileged system control.</span>
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4 text-[var(--text)]">System</h2>
          <div className="p-6 rounded-[var(--panel-radius)] border border-[var(--border)] bg-[var(--surface)] shadow-sm space-y-4 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Start with Windows</h3>
                <p className="text-sm text-[var(--muted)]">Launch assistant automatically on boot.</p>
              </div>
              <div className="w-10 h-5 bg-[var(--accent)] rounded-full relative cursor-pointer transition-colors duration-300">
                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
              </div>
            </div>
            
            <div className="h-px bg-[var(--border)] w-full" />
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Hardware Acceleration</h3>
                <p className="text-sm text-[var(--muted)]">Use GPU for rendering and processing.</p>
              </div>
              <div className="w-10 h-5 bg-[var(--accent)] rounded-full relative cursor-pointer transition-colors duration-300">
                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
