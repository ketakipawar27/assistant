import { Mic, MicOff, Settings, Moon, Sparkles, Terminal } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

export function TopBar() {
  const { persona, setPersona, isMicActive, toggleMic } = useAppStore();

  return (
    <header className="h-14 flex-shrink-0 flex items-center justify-between px-6 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-sm transition-colors duration-300">
      <div className="flex items-center gap-4">
        {/* Window controls placeholder (for desktop feel) */}
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
          <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Persona Switch */}
        <div className="flex items-center bg-[var(--bg)] rounded-full p-1 border border-[var(--border)]">
          <button
            onClick={() => setPersona('titan')}
            className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300",
              persona === 'titan' 
                ? "bg-[var(--surface)] text-blue-400 shadow-sm" 
                : "text-[var(--muted)] hover:text-[var(--text)]"
            )}
          >
            <Moon className="w-3 h-3" />
            Titan
          </button>
          <button
            onClick={() => setPersona('astra')}
            className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300",
              persona === 'astra' 
                ? "bg-[var(--surface)] text-purple-400 shadow-sm" 
                : "text-[var(--muted)] hover:text-[var(--text)]"
            )}
          >
            <Sparkles className="w-3 h-3" />
            Astra
          </button>
          <button
            onClick={() => setPersona('sudo')}
            className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300",
              persona === 'sudo' 
                ? "bg-[var(--surface)] text-emerald-400 shadow-sm" 
                : "text-[var(--muted)] hover:text-[var(--text)]"
            )}
          >
            <Terminal className="w-3 h-3" />
            SUDO
          </button>
        </div>

        <div className="h-4 w-px bg-[var(--border)] mx-2" />

        {/* Mic Toggle */}
        <button
          onClick={toggleMic}
          className={cn(
            "p-2 rounded-full transition-all duration-300",
            isMicActive 
              ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" 
              : "text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--text)]"
          )}
          title={isMicActive ? "Mute Microphone" : "Unmute Microphone"}
        >
          {isMicActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>

        {/* Settings */}
        <button className="p-2 rounded-full text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--text)] transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
