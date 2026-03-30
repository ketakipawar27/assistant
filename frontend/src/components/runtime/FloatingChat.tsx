import { useAppStore } from '@/store/useAppStore';
import { useRuntimeStore } from '@/store/useRuntimeStore';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, X, Maximize2, Minimize2, TerminalSquare, BrainCircuit, Send, Paperclip, MonitorUp } from 'lucide-react';
import { AssistantOrb } from './AssistantOrb';
import { useState } from 'react';
import { ToolExecutionCard, ResultCard } from '../chat/RichMessageBlocks';

export function FloatingChat() {
  const persona = useAppStore(s => s.persona);
  const { floatingChat, setFloatingChat, assistantState } = useRuntimeStore();
  const [input, setInput] = useState('');

  if (!floatingChat.isOpen) return null;

  const isSudo = persona === 'sudo';
  const isTitan = persona === 'titan';

  const getAssistantName = () => {
    if (isSudo) return 'root@sudo:~#';
    if (isTitan) return 'Ask Titan...';
    return 'Ask Astra...';
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFloatingChat({ isOpen: false });
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFloatingChat({ mode: floatingChat.mode === 'expanded' ? 'popup' : 'expanded' });
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center pointer-events-none">
      <AnimatePresence mode="wait">
        
        {/* COLLAPSED STATE */}
        {floatingChat.mode === 'collapsed' && (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            onClick={() => setFloatingChat({ mode: 'popup' })}
            className={cn(
              "pointer-events-auto flex items-center gap-3 px-4 py-2 bg-[var(--surface)]/90 backdrop-blur-xl border border-[var(--border)] rounded-full shadow-lg cursor-pointer hover:border-[var(--accent)] transition-colors group",
              isSudo && "rounded-sm border-emerald-500/30 hover:border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
            )}
          >
            <AssistantOrb state={assistantState} size="sm" className="w-6 h-6" />
            <span className={cn(
              "text-sm font-medium text-[var(--muted)] group-hover:text-[var(--text)] transition-colors",
              isSudo && "font-mono text-emerald-500/70 group-hover:text-emerald-400"
            )}>
              {getAssistantName()}
            </span>
            <div className="w-px h-4 bg-[var(--border)] mx-1" />
            <button className={cn(
              "p-1.5 rounded-full text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors",
              isSudo && "hover:text-emerald-400 hover:bg-emerald-500/10 rounded-sm"
            )}>
              <Mic className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* POPUP & EXPANDED STATES */}
        {(floatingChat.mode === 'popup' || floatingChat.mode === 'expanded') && (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              "pointer-events-auto flex flex-col bg-[var(--surface)]/95 backdrop-blur-xl border border-[var(--border)] shadow-2xl overflow-hidden transition-all duration-300",
              isSudo ? "rounded-sm border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]" : "rounded-2xl",
              floatingChat.mode === 'expanded' ? "w-[600px] h-[500px]" : "w-[450px] h-auto"
            )}
          >
            {/* Header */}
            <div className={cn(
              "flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--bg)]/50",
              isSudo && "border-emerald-500/20"
            )}>
              <div className="flex items-center gap-2">
                <AssistantOrb state={assistantState} size="sm" className="w-5 h-5" />
                <span className={cn(
                  "text-xs font-semibold uppercase tracking-wider text-[var(--text)]",
                  isSudo && "font-mono text-emerald-500"
                )}>
                  {isSudo ? 'SUDO Terminal' : isTitan ? 'Titan Command' : 'Astra Assistant'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={toggleExpand} className={cn(
                  "p-1.5 text-[var(--muted)] hover:text-[var(--text)] rounded transition-colors",
                  isSudo && "hover:text-emerald-400"
                )}>
                  {floatingChat.mode === 'expanded' ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button onClick={handleClose} className={cn(
                  "p-1.5 text-[var(--muted)] hover:text-[var(--text)] rounded transition-colors",
                  isSudo && "hover:text-emerald-400"
                )}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Expanded Content Area (Thread) */}
            {floatingChat.mode === 'expanded' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="flex flex-col gap-1 items-end">
                  <div className={cn(
                    "px-3 py-2 rounded-xl text-sm bg-[var(--bg)] border border-[var(--border)] text-[var(--text)]",
                    isSudo && "font-mono rounded-sm border-emerald-500/20 text-emerald-50"
                  )}>
                    Take a screenshot and copy it
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-start">
                  <ToolExecutionCard name="system.captureScreen" status="completed" details="Captured display 1" isLast />
                  <ResultCard title="Screenshot Copied" description="Image copied to clipboard." iconType="info" />
                </div>
              </div>
            )}

            {/* Popup Content Area (Suggestions) */}
            {floatingChat.mode === 'popup' && (
              <div className="p-4 space-y-3">
                <div className={cn("text-xs font-medium text-[var(--muted)] uppercase tracking-wider", isSudo && "font-mono")}>
                  Suggested Actions
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Take Screenshot', 'Mute Volume', 'Open VS Code', 'Summarize Downloads'].map((s, i) => (
                    <button key={i} className={cn(
                      "px-3 py-1.5 text-xs font-medium bg-[var(--bg)] border border-[var(--border)] rounded-full text-[var(--text)] hover:border-[var(--accent)] transition-colors",
                      isSudo && "font-mono rounded-sm hover:border-emerald-500 hover:text-emerald-400"
                    )}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className={cn(
              "p-3 bg-[var(--bg)] border-t border-[var(--border)]",
              isSudo && "border-emerald-500/20"
            )}>
              <div className={cn(
                "flex items-center gap-2 p-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl focus-within:border-[var(--accent)] transition-colors",
                isSudo && "rounded-sm border-emerald-500/30 focus-within:border-emerald-500/60"
              )}>
                <button className={cn("p-2 text-[var(--muted)] hover:text-[var(--text)] rounded-lg", isSudo && "hover:text-emerald-400 rounded-sm")}>
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isSudo ? "Enter command..." : "Ask anything..."}
                  className={cn(
                    "flex-1 bg-transparent border-none focus:outline-none text-sm text-[var(--text)] placeholder:text-[var(--muted)]",
                    isSudo && "font-mono text-emerald-50 placeholder:text-emerald-500/50"
                  )}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && input.trim()) {
                      setFloatingChat({ mode: 'expanded' });
                      setInput('');
                    }
                  }}
                />
                <button className={cn("p-2 text-[var(--muted)] hover:text-[var(--text)] rounded-lg", isSudo && "hover:text-emerald-400 rounded-sm")}>
                  <Mic className="w-4 h-4" />
                </button>
                <button 
                  disabled={!input.trim()}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    input.trim() 
                      ? isSudo ? "bg-emerald-600 text-black hover:bg-emerald-500" : "bg-[var(--accent)] text-white hover:opacity-90"
                      : "bg-[var(--bg)] text-[var(--muted)] cursor-not-allowed",
                    isSudo && "rounded-sm"
                  )}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
