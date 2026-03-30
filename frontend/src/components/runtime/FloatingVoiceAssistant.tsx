import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '@/store/useAppStore';
import { useRuntimeStore } from '@/store/useRuntimeStore';
import { cn } from '@/lib/utils';
import { AssistantOrb, AssistantState } from './AssistantOrb';
import { VoiceWaveform } from './VoiceWaveform';
import { X, Square, TerminalSquare, BrainCircuit, Mic, CheckCircle2, Loader2, AlertTriangle, FileText } from 'lucide-react';
import { ToolExecutionCard, ResultCard } from '../chat/RichMessageBlocks';

interface FloatingVoiceAssistantProps {
  state: AssistantState;
  transcript?: string;
  taskPreview?: string;
  onClose?: () => void;
  onStop?: () => void;
}

export function FloatingVoiceAssistant({ state, transcript, taskPreview, onClose, onStop }: FloatingVoiceAssistantProps) {
  const persona = useAppStore(s => s.persona);
  const isSudo = persona === 'sudo';
  const isTitan = persona === 'titan';

  const getAssistantName = () => {
    if (isSudo) return 'root@sudo:~#';
    if (isTitan) return 'Titan Command';
    return 'Astra Assistant';
  };

  const getStatusText = () => {
    switch (state) {
      case 'idle': return isSudo ? 'SYSTEM READY' : 'Ready';
      case 'listening': return isSudo ? 'CAPTURING INPUT...' : isTitan ? 'Listening for command...' : 'I\'m listening...';
      case 'thinking': return isSudo ? 'PARSING INTENT...' : 'Thinking...';
      case 'executing': return isSudo ? 'EXECUTING TASK...' : 'Working on that...';
      case 'completed': return isSudo ? 'EXECUTION COMPLETE' : 'Done.';
      case 'failed': return isSudo ? 'EXECUTION FAILED' : 'Task failed.';
      case 'confirming': return isSudo ? 'AWAITING CONFIRMATION' : 'Waiting for confirmation...';
      default: return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={cn(
        "w-[480px] bg-[var(--surface)]/95 backdrop-blur-2xl border border-[var(--border)] shadow-2xl flex flex-col overflow-hidden relative",
        isSudo ? "rounded-sm border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.15)]" : "rounded-3xl"
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between px-5 py-3 border-b border-[var(--border)] bg-[var(--bg)]/50",
        isSudo && "border-emerald-500/20"
      )}>
        <div className="flex items-center gap-2.5">
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
            isTitan ? "bg-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.3)]" :
            isSudo ? "bg-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.3)] rounded-sm border border-emerald-400/30" :
            "bg-purple-600 shadow-[0_0_10px_rgba(192,132,252,0.3)]"
          )}>
            {isSudo ? <TerminalSquare className="w-3.5 h-3.5 text-emerald-50" /> : <BrainCircuit className="w-3.5 h-3.5 text-white" />}
          </div>
          <span className={cn(
            "text-xs font-semibold uppercase tracking-wider text-[var(--text)]",
            isSudo && "font-mono text-emerald-500"
          )}>
            {getAssistantName()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {state !== 'idle' && state !== 'completed' && state !== 'failed' && (
            <button onClick={onStop} className={cn(
              "p-1.5 text-[var(--muted)] hover:text-red-400 rounded transition-colors",
              isSudo && "hover:bg-red-500/10"
            )} title="Stop">
              <Square className="w-4 h-4 fill-current" />
            </button>
          )}
          <button onClick={onClose} className={cn(
            "p-1.5 text-[var(--muted)] hover:text-[var(--text)] rounded transition-colors",
            isSudo && "hover:text-emerald-400 hover:bg-emerald-500/10"
          )} title="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 flex flex-col items-center text-center">
        
        {/* Visualizer / Orb Area */}
        <div className="h-24 flex items-center justify-center mb-6">
          <AnimatePresence mode="wait">
            {state === 'listening' ? (
              <motion.div
                key="waveform"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center justify-center"
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
                <AssistantOrb state={state} size="lg" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status Badge */}
        <div className={cn(
          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 transition-colors",
          state === 'failed' ? "bg-red-500/10 text-red-500 border border-red-500/20" : 
          state === 'completed' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
          isSudo ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 font-mono rounded-sm" :
          "bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20"
        )}>
          {getStatusText()}
        </div>

        {/* Live Transcript / Response Area */}
        <div className="w-full min-h-[80px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {state === 'idle' ? (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  "text-sm text-[var(--muted)]",
                  isSudo && "font-mono text-emerald-500/50"
                )}
              >
                {isSudo ? '> AWAITING VOICE INPUT...' : 'Try: "Open VS Code" or "Take a screenshot"'}
              </motion.div>
            ) : state === 'listening' ? (
              <motion.div
                key="listening"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center gap-3"
              >
                <div className={cn(
                  "text-xl font-medium text-[var(--text)] leading-tight",
                  isSudo && "font-mono text-emerald-400 text-lg"
                )}>
                  {transcript || (isSudo ? '_' : '...')}
                </div>
                <div className="flex items-center gap-1.5">
                  <motion.div 
                    animate={{ opacity: [0.3, 1, 0.3] }} 
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]"
                  />
                  <span className={cn(
                    "text-[10px] uppercase tracking-wider text-[var(--muted)] font-semibold",
                    isSudo && "font-mono text-emerald-500/50"
                  )}>
                    {isSudo ? 'REC' : 'Recording'}
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="response"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full flex flex-col items-start text-left gap-3"
              >
                {/* Intent Preview */}
                {transcript && (
                  <div className={cn(
                    "w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)]",
                    isSudo && "font-mono rounded-sm border-emerald-500/20 text-emerald-50 bg-emerald-500/5"
                  )}>
                    <div className={cn(
                      "text-[10px] uppercase tracking-wider mb-1",
                      isSudo ? "text-emerald-500/50" : "text-[var(--muted)]"
                    )}>
                      Parsed Intent
                    </div>
                    "{transcript}"
                  </div>
                )}

                {/* Task Preview / Execution Steps */}
                {taskPreview && (
                  <div className="w-full">
                    {state === 'executing' ? (
                      <ToolExecutionCard name={taskPreview} status="running" details="Processing..." isLast />
                    ) : state === 'completed' ? (
                      <ResultCard title="Task Completed" description={taskPreview} iconType="success" />
                    ) : state === 'failed' ? (
                      <ResultCard title="Task Failed" description={taskPreview} iconType="error" />
                    ) : (
                      <div className={cn(
                        "w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-sm text-[var(--muted)]",
                        isSudo && "font-mono rounded-sm border-emerald-500/20 text-emerald-500/70"
                      )}>
                        {taskPreview}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  );
}
