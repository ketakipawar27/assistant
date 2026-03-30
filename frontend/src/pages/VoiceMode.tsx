import { PageHeader } from '@/components/common/PageHeader';
import { useAppStore } from '@/store/useAppStore';
import { useRuntimeStore } from '@/store/useRuntimeStore';
import { cn } from '@/lib/utils';
import { Mic, Square, Settings2, Activity } from 'lucide-react';
import { AssistantOrb } from '@/components/runtime/AssistantOrb';
import { VoiceWaveform } from '@/components/runtime/VoiceWaveform';
import { motion, AnimatePresence } from 'motion/react';

export function VoiceMode() {
  const persona = useAppStore(s => s.persona);
  const isSudo = persona === 'sudo';
  const { assistantState, setAssistantState } = useRuntimeStore();

  const isListening = assistantState === 'listening';

  const toggleListening = () => {
    if (isListening) {
      setAssistantState('idle');
    } else {
      setAssistantState('listening');
      // Auto-reset after a few seconds for demo
      setTimeout(() => {
        if (useRuntimeStore.getState().assistantState === 'listening') {
          setAssistantState('thinking');
          setTimeout(() => setAssistantState('idle'), 2000);
        }
      }, 4000);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader 
        title={isSudo ? "VOICE INTERFACE" : "Voice Mode"} 
        description={isSudo ? "Hands-free terminal access." : "Hands-free interaction and continuous listening."} 
      />
      
      <div className={cn(
        "flex-1 rounded-[var(--panel-radius)] border border-[var(--border)] bg-[var(--surface)] shadow-sm flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden",
        isSudo && "border-emerald-500/20"
      )}>
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        {/* Ambient Glow */}
        {isListening && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "absolute inset-0 blur-3xl opacity-10",
              isSudo ? "bg-emerald-500" : persona === 'titan' ? "bg-blue-500" : "bg-purple-500"
            )}
          />
        )}

        <div className="relative z-10 flex flex-col items-center gap-12 w-full max-w-2xl px-8">
          
          {/* Status Indicator */}
          <div className={cn(
            "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors shadow-sm flex items-center gap-2",
            isListening ? (isSudo ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30" : "bg-red-500/10 text-red-500 border border-red-500/20") :
            isSudo ? "bg-emerald-500/5 text-emerald-500/50 border border-emerald-500/20 font-mono rounded-sm" :
            "bg-[var(--bg)] text-[var(--muted)] border border-[var(--border)]"
          )}>
            {isListening && <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className={cn("w-2 h-2 rounded-full", isSudo ? "bg-emerald-500" : "bg-red-500")} />}
            {isListening ? (isSudo ? 'CAPTURING AUDIO' : 'Listening') : (isSudo ? 'SYSTEM READY' : 'Ready')}
          </div>

          {/* Main Visualizer */}
          <div className="h-48 flex items-center justify-center w-full">
            <AnimatePresence mode="wait">
              {isListening ? (
                <motion.div
                  key="waveform"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="w-full flex justify-center"
                >
                  <VoiceWaveform isListening={true} />
                </motion.div>
              ) : (
                <motion.div
                  key="orb"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <AssistantOrb state={assistantState} size="xl" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Transcript Area */}
          <div className="h-24 flex items-center justify-center w-full text-center">
            <AnimatePresence mode="wait">
              {isListening ? (
                <motion.div
                  key="transcript"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    "text-2xl font-medium text-[var(--text)] leading-tight",
                    isSudo && "font-mono text-emerald-400 text-xl"
                  )}
                >
                  {isSudo ? 'Awaiting command input_' : 'I\'m listening...'}
                </motion.div>
              ) : assistantState === 'thinking' ? (
                <motion.div
                  key="thinking"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    "text-xl text-[var(--muted)] italic",
                    isSudo && "font-mono text-emerald-500/70 not-italic"
                  )}
                >
                  {isSudo ? 'Processing...' : 'Thinking...'}
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    "text-lg text-[var(--muted)]",
                    isSudo && "font-mono text-emerald-500/50"
                  )}
                >
                  {isSudo ? 'Click the microphone to begin.' : 'Tap the microphone to speak.'}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6 mt-4">
            <button className={cn(
              "p-4 rounded-full bg-[var(--bg)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--accent)]/50 transition-all",
              isSudo && "rounded-sm border-emerald-500/20 hover:border-emerald-500/50 hover:text-emerald-400"
            )}>
              <Settings2 className="w-5 h-5" />
            </button>
            
            <button 
              onClick={toggleListening}
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg",
                isListening 
                  ? (isSudo ? "bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400" : "bg-red-500/20 border-2 border-red-500 text-red-500")
                  : (isSudo ? "bg-emerald-600 text-emerald-50 hover:bg-emerald-500 rounded-sm" : "bg-[var(--text)] text-[var(--bg)] hover:opacity-90")
              )}
            >
              {isListening ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-8 h-8" />}
            </button>

            <button className={cn(
              "p-4 rounded-full bg-[var(--bg)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--accent)]/50 transition-all",
              isSudo && "rounded-sm border-emerald-500/20 hover:border-emerald-500/50 hover:text-emerald-400"
            )}>
              <Activity className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
