import { useAppStore } from '@/store/useAppStore';
import { useRuntimeStore } from '@/store/useRuntimeStore';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, X, Maximize2, Minimize2, TerminalSquare, BrainCircuit, Send, Paperclip, MonitorUp } from 'lucide-react';
import { AssistantOrb } from './AssistantOrb';
import { ToolExecutionCard, ResultCard } from '../chat/RichMessageBlocks';

interface FloatingChatProps {
  onOpenApp?: () => void;
}

export function FloatingChat({ onOpenApp }: FloatingChatProps = {}) {
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
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={() => setFloatingChat({ mode: 'popup' })}
            className={cn(
              "pointer-events-auto flex items-center gap-3 px-5 py-3 bg-[var(--surface)]/95 backdrop-blur-2xl border border-[var(--border)] rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] cursor-pointer hover:border-[var(--accent)] transition-all group",
              isSudo && "rounded-sm border-emerald-500/30 hover:border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
            )}
          >
            <AssistantOrb state={assistantState} size="sm" forceCircle className="w-7 h-7 shrink-0" />
            <span className={cn(
              "text-sm font-medium text-[var(--muted)] group-hover:text-[var(--text)] transition-colors tracking-wide",
              isSudo && "font-mono text-emerald-500/70 group-hover:text-emerald-400"
            )}>
              {getAssistantName()}
            </span>
            <div className="w-px h-5 bg-[var(--border)] mx-2" />
            <button className={cn(
              "p-2 rounded-full text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors",
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
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              "pointer-events-auto flex flex-col bg-[var(--surface)]/95 backdrop-blur-2xl border border-[var(--border)] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-300",
              isSudo ? "rounded-sm border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.15)]" : "rounded-3xl",
              floatingChat.mode === 'expanded' ? "w-[600px] h-[550px]" : "w-[480px] h-auto"
            )}
          >
            {/* Header */}
            <div className={cn(
              "flex items-center justify-between px-5 py-4 border-b border-[var(--border)] bg-[var(--bg)]/50",
              isSudo && "border-emerald-500/20"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                  isTitan ? "bg-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.3)]" :
                  isSudo ? "bg-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.3)] border border-emerald-400/30" :
                  "bg-purple-600 shadow-[0_0_10px_rgba(192,132,252,0.3)]"
                )}>
                  {isSudo ? <TerminalSquare className="w-4 h-4 text-emerald-50" /> : <BrainCircuit className="w-4 h-4 text-white" />}
                </div>
                <span className={cn(
                  "text-xs font-semibold uppercase tracking-wider text-[var(--text)]",
                  isSudo && "font-mono text-emerald-500"
                )}>
                  {isSudo ? 'SUDO Terminal' : isTitan ? 'Titan Command' : 'Astra Assistant'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {floatingChat.mode === 'expanded' && (
                  <button onClick={onOpenApp} className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] rounded-lg transition-colors border border-transparent hover:border-[var(--border)] hover:bg-[var(--bg)]",
                    isSudo && "hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 rounded-sm font-mono"
                  )}>
                    <MonitorUp className="w-3.5 h-3.5" />
                    Open in App
                  </button>
                )}
                <button onClick={toggleExpand} className={cn(
                  "p-2 text-[var(--muted)] hover:text-[var(--text)] rounded-lg transition-colors",
                  isSudo && "hover:text-emerald-400 hover:bg-emerald-500/10 rounded-sm"
                )}>
                  {floatingChat.mode === 'expanded' ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button onClick={handleClose} className={cn(
                  "p-2 text-[var(--muted)] hover:text-[var(--text)] rounded-lg transition-colors",
                  isSudo && "hover:text-emerald-400 hover:bg-emerald-500/10 rounded-sm"
                )}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Expanded Content Area (Thread) */}
            {floatingChat.mode === 'expanded' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex flex-col gap-2 items-end">
                  <div className={cn(
                    "px-4 py-2.5 rounded-2xl text-[15px] bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] shadow-sm",
                    isSudo && "font-mono rounded-sm border-emerald-500/20 text-emerald-50"
                  )}>
                    Take a screenshot and copy it
                  </div>
                </div>
                <div className="flex flex-col gap-3 items-start w-full">
                  <ToolExecutionCard name="system.captureScreen" status="completed" details="Captured display 1" isLast />
                  <ResultCard title="Screenshot Copied" description="Image copied to clipboard." iconType="info" />
                </div>
              </div>
            )}

            {/* Popup Content Area (Suggestions) */}
            {floatingChat.mode === 'popup' && (
              <div className="p-6 space-y-4">
                <div className={cn("text-xs font-semibold text-[var(--muted)] uppercase tracking-widest", isSudo && "font-mono")}>
                  Suggested Actions
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {['Take Screenshot', 'Mute Volume', 'Open VS Code', 'Summarize Downloads'].map((s, i) => (
                    <button key={i} className={cn(
                      "px-4 py-2 text-[13px] font-medium bg-[var(--bg)] border border-[var(--border)] rounded-full text-[var(--text)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all",
                      isSudo && "font-mono rounded-sm hover:border-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                    )}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className={cn(
              "p-4 bg-[var(--bg)] border-t border-[var(--border)]",
              isSudo && "border-emerald-500/20"
            )}>
              <div className={cn(
                "flex items-center gap-2 p-2 bg-[var(--surface)] border border-[var(--border)] rounded-2xl focus-within:border-[var(--accent)] focus-within:shadow-[0_0_0_2px_rgba(var(--accent-rgb),0.1)] transition-all",
                isSudo && "rounded-sm border-emerald-500/30 focus-within:border-emerald-500/60 focus-within:shadow-[0_0_0_2px_rgba(16,185,129,0.1)]"
              )}>
                <button className={cn("p-2.5 text-[var(--muted)] hover:text-[var(--text)] rounded-xl transition-colors", isSudo && "hover:text-emerald-400 rounded-sm")}>
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isSudo ? "Enter command..." : "Ask anything..."}
                  className={cn(
                    "flex-1 bg-transparent border-none focus:outline-none text-[15px] text-[var(--text)] placeholder:text-[var(--muted)]",
                    isSudo && "font-mono text-emerald-50 placeholder:text-emerald-500/50"
                  )}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && input.trim()) {
                      setFloatingChat({ mode: 'expanded' });
                      setInput('');
                    }
                  }}
                />
                <button className={cn("p-2.5 text-[var(--muted)] hover:text-[var(--text)] rounded-xl transition-colors", isSudo && "hover:text-emerald-400 rounded-sm")}>
                  <Mic className="w-4 h-4" />
                </button>
                <button 
                  disabled={!input.trim()}
                  className={cn(
                    "p-2.5 rounded-xl transition-all flex items-center justify-center",
                    input.trim() 
                      ? isSudo ? "bg-emerald-600 text-black hover:bg-emerald-500" : "bg-[var(--accent)] text-white hover:opacity-90 shadow-md"
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
