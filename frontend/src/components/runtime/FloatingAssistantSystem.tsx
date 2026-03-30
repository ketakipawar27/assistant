import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '@/store/useAppStore';
import { useRuntimeStore } from '@/store/useRuntimeStore';
import { cn } from '@/lib/utils';
import { AssistantOrb } from './AssistantOrb';
import { VoiceWaveform } from './VoiceWaveform';
import { Mic, Send, X, Maximize2, Paperclip, CheckCircle2, Loader2, Square, TerminalSquare, BrainCircuit, ChevronDown, MoreHorizontal, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type InteractionState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'executing' | 'completed';

export function FloatingAssistantSystem() {
  const navigate = useNavigate();
  const persona = useAppStore(s => s.persona);
  const isSudo = persona === 'sudo';
  const isTitan = persona === 'titan';

  // Local state for the demo/UI
  const [isExpanded, setIsExpanded] = useState(false);
  const [interactionState, setInteractionState] = useState<InteractionState>('idle');
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<{id: string, role: 'user' | 'assistant' | 'system', content: string, status?: 'pending' | 'running' | 'completed'}[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Toggle between command and conversational demo
  const [demoMode, setDemoMode] = useState<'command' | 'conversation'>('command');

  const getAssistantName = () => {
    if (isSudo) return 'root@sudo:~#';
    if (isTitan) return 'Titan';
    return 'Astra';
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, interactionState]);

  const handleMicClick = () => {
    if (!isExpanded) setIsExpanded(true);
    
    if (interactionState === 'idle' || interactionState === 'completed') {
      setInteractionState('listening');
      if (interactionState === 'idle') setMessages([]);
    } else if (interactionState === 'listening') {
      // User finished speaking -> Transition to Thinking
      setInteractionState('thinking');
      
      const userText = demoMode === 'command' 
        ? 'Open VS Code and summarize my Downloads folder' 
        : 'What is on my calendar today?';
        
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userText }]);

      // Simulate AI Processing
      setTimeout(() => {
        setInteractionState('speaking');
        
        if (demoMode === 'command') {
          setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Opening VS Code now. Let me check your Downloads folder.' }]);
          
          // Transition to Executing
          setTimeout(() => {
            setInteractionState('executing');
            setMessages(prev => [
              ...prev,
              { id: (Date.now() + 2).toString(), role: 'system', content: 'app.open(VS Code)', status: 'completed' },
              { id: (Date.now() + 3).toString(), role: 'system', content: 'folder.summarize(~/Downloads)', status: 'running' }
            ]);
            
            // Complete Execution
            setTimeout(() => {
              setMessages(prev => prev.map(m => m.status === 'running' ? { ...m, status: 'completed' } : m));
              setInteractionState('completed');
              setMessages(prev => [...prev, { id: (Date.now() + 4).toString(), role: 'assistant', content: 'Done. I summarized 12 files.' }]);
              
              // CONTINUOUS SESSION: Return to listening
              setTimeout(() => {
                setInteractionState('listening');
                setDemoMode('conversation'); // Switch demo mode for next interaction
              }, 2500);
            }, 3000);
          }, 2500);
          
        } else {
          // Conversational Flow
          setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'You have 3 meetings today. Your next one is "Design Sync" at 2:00 PM.' }]);
          
          setTimeout(() => {
            setInteractionState('completed');
            
            // CONTINUOUS SESSION: Return to listening
            setTimeout(() => {
              setInteractionState('listening');
              setDemoMode('command'); // Switch demo mode
            }, 2000);
          }, 3500);
        }
      }, 1500);
      
    } else {
      // Interrupt / Stop
      setInteractionState('idle');
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    if (!isExpanded) setIsExpanded(true);
    
    const newMessages = [
      ...messages,
      { id: Date.now().toString(), role: 'user' as const, content: inputValue },
      { id: (Date.now() + 1).toString(), role: 'assistant' as const, content: 'Executing command...' },
      { id: (Date.now() + 2).toString(), role: 'system' as const, content: `system.execute("${inputValue}")`, status: 'running' as const }
    ];
    setMessages(newMessages);
    setInputValue('');
    setInteractionState('executing');
    
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.status === 'running' ? { ...m, status: 'completed' } : m));
      setInteractionState('completed');
      
      setTimeout(() => {
        setInteractionState('listening');
      }, 2000);
    }, 2000);
  };

  const handleClose = () => {
    setInteractionState('idle');
    setMessages([]);
    useRuntimeStore.getState().setFloatingChat({ isOpen: false });
  };

  const handleOpenApp = () => {
    handleClose();
    navigate('/chat');
  };

  // 1. COLLAPSED IDLE DOCK
  if (!isExpanded) {
    return (
      <motion.div
        key="collapsed-dock"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]"
      >
        <div 
          onClick={() => setIsExpanded(true)}
          className={cn(
            "flex items-center gap-3 px-2 py-2 rounded-full cursor-pointer shadow-2xl backdrop-blur-2xl border transition-all hover:scale-105 group",
            isSudo ? "bg-black/90 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)]" : 
            "bg-[var(--surface)]/80 border-[var(--border)] shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
          )}
        >
          <AssistantOrb state="idle" size="sm" forceCircle className="w-10 h-10 shrink-0" />
          <div className={cn(
            "text-[15px] font-medium pr-12 pl-2",
            isSudo ? "font-mono text-emerald-500/70" : "text-[var(--muted)] group-hover:text-[var(--text)] transition-colors"
          )}>
            Ask {getAssistantName()}...
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); handleMicClick(); }}
            className={cn(
              "absolute right-2 w-10 h-10 rounded-full flex items-center justify-center transition-all",
              isSudo ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" : 
              "bg-[var(--text)] text-[var(--bg)] hover:scale-105 shadow-md"
            )}
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    );
  }

  // EXPANDED PANEL STATES
  return (
    <motion.div
      key="expanded-panel"
      initial={{ y: 50, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 50, opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={cn(
        "fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[460px] flex flex-col overflow-hidden shadow-2xl backdrop-blur-3xl border",
        isSudo ? "bg-black/95 border-emerald-500/30 rounded-sm shadow-[0_0_50px_rgba(16,185,129,0.15)]" : 
        "bg-[var(--surface)]/90 border-[var(--border)] rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between px-5 py-4 border-b",
        isSudo ? "border-emerald-500/20 bg-emerald-950/20" : "border-[var(--border)] bg-[var(--bg)]/30"
      )}>
        <div className="flex items-center gap-3">
          <AssistantOrb state={interactionState === 'listening' ? 'listening' : 'idle'} size="sm" forceCircle className="w-7 h-7 shrink-0" />
          <span className={cn(
            "text-sm font-semibold tracking-wide",
            isSudo ? "font-mono text-emerald-500" : "text-[var(--text)]"
          )}>
            {getAssistantName()}
          </span>
          
          {/* State Badges */}
          <AnimatePresence mode="wait">
            <motion.span 
              key={interactionState}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={cn(
                "text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border flex items-center gap-1.5",
                interactionState === 'listening' ? (isSudo ? "font-mono text-emerald-400 border-emerald-500/30 bg-emerald-500/10" : "text-red-500 border-red-500/20 bg-red-500/10") :
                interactionState === 'speaking' ? (isSudo ? "font-mono text-emerald-400 border-emerald-500/30 bg-emerald-500/10" : "text-purple-500 border-purple-500/20 bg-purple-500/10") :
                interactionState === 'executing' ? (isSudo ? "font-mono text-emerald-400 border-emerald-500/30 bg-emerald-500/10" : "text-blue-500 border-blue-500/20 bg-blue-500/10") :
                (isSudo ? "font-mono text-emerald-500/70 border-emerald-500/30 bg-emerald-500/10" : "text-[var(--muted)] border-[var(--border)] bg-[var(--bg)]/50")
              )}
            >
              {(interactionState === 'listening' || interactionState === 'speaking') && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
              {interactionState === 'idle' ? 'Ready' : interactionState}
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={handleOpenApp}
            className={cn(
            "p-1.5 rounded-lg transition-colors",
            isSudo ? "text-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/10" : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]"
          )}>
            <ArrowUpRight className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsExpanded(false)}
            className={cn(
            "p-1.5 rounded-lg transition-colors",
            isSudo ? "text-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/10" : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]"
          )}>
            <ChevronDown className="w-4 h-4" />
          </button>
          <button 
            onClick={handleClose}
            className={cn(
            "p-1.5 rounded-lg transition-colors",
            isSudo ? "text-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/10" : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]"
          )}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body Content based on State */}
      <div className="flex-1 min-h-[240px] max-h-[440px] overflow-y-auto p-5 flex flex-col gap-4 scrollbar-hide relative">
        
        {/* HERO WAVEFORM AREA - Persistent but animates size/position */}
        <motion.div 
          layout
          className={cn(
            "w-full flex flex-col items-center justify-center transition-all duration-500",
            (interactionState === 'listening' || interactionState === 'speaking' || interactionState === 'thinking') && messages.length === 0 ? "h-32 mt-4" : "h-12 mt-0 mb-2"
          )}
        >
          <div className={cn(
            "relative flex items-center justify-center transition-all duration-500",
            (interactionState === 'listening' || interactionState === 'speaking' || interactionState === 'thinking') && messages.length === 0 ? "w-full h-24" : "w-1/2 h-8"
          )}>
            <div className={cn(
              "absolute inset-0 blur-3xl rounded-full transition-opacity duration-500",
              interactionState === 'idle' ? "opacity-0" : "opacity-20",
              isSudo ? "bg-emerald-500" : isTitan ? "bg-blue-500" : "bg-purple-500"
            )} />
            <VoiceWaveform state={interactionState} />
          </div>
        </motion.div>

        {/* 2. EXPANDED IDLE / READY PANEL */}
        {interactionState === 'idle' && messages.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-start text-center gap-6 mt-4"
          >
            <div className={cn(
              "text-xl font-medium tracking-tight",
              isSudo ? "font-mono text-emerald-400" : "text-[var(--text)]"
            )}>
              How can I help you?
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-w-[85%]">
              {["Take a screenshot", "Summarize unread emails", "What's on my calendar?"].map((action, i) => (
                <button key={i} className={cn(
                  "text-xs px-4 py-2 rounded-full border transition-colors",
                  isSudo ? "font-mono border-emerald-500/20 text-emerald-500/70 hover:bg-emerald-500/10 hover:text-emerald-400" : 
                  "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]"
                )}>
                  {action}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* 3. LISTENING / LIVE VOICE MODE PANEL (Empty State) */}
        {interactionState === 'listening' && messages.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-start gap-8"
          >
            <div className={cn(
              "text-xl font-medium text-center max-w-[90%] leading-tight text-[var(--muted)]",
              isSudo && "font-mono text-emerald-500/70 text-lg"
            )}>
              {demoMode === 'command' ? '"Open VS Code and summarize my Downloads folder..."' : '"What is on my calendar today?"'}
            </div>
          </motion.div>
        )}

        {/* 4. CONVERSATION & EXECUTION PANEL */}
        <AnimatePresence>
          {(messages.length > 0) && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col gap-6 pb-2"
            >
              {messages.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  key={msg.id} 
                  className={cn(
                    "flex flex-col gap-2",
                    msg.role === 'user' ? "items-end" : "items-start"
                  )}
                >
                  {msg.role === 'user' && (
                    <div className={cn(
                      "px-4 py-2.5 rounded-2xl max-w-[85%] text-[15px] shadow-sm",
                      isSudo ? "bg-emerald-900/30 text-emerald-100 border border-emerald-500/30 rounded-sm font-mono" : 
                      "bg-[var(--bg)] border border-[var(--border)] text-[var(--text)]"
                    )}>
                      {msg.content}
                    </div>
                  )}
                  
                  {msg.role === 'assistant' && (
                    <div className={cn(
                      "text-[15px] px-2 leading-relaxed",
                      isSudo ? "font-mono text-emerald-400" : "text-[var(--text)]"
                    )}>
                      {msg.content}
                    </div>
                  )}

                  {msg.role === 'system' && (
                    <div className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl border w-full text-sm shadow-sm",
                      isSudo ? "bg-black border-emerald-500/20 font-mono rounded-sm" : "bg-[var(--bg)] border-[var(--border)]"
                    )}>
                      {msg.status === 'running' ? (
                        <Loader2 className={cn("w-4 h-4 animate-spin", isSudo ? "text-emerald-500" : "text-[var(--accent)]")} />
                      ) : (
                        <CheckCircle2 className={cn("w-4 h-4", isSudo ? "text-emerald-500" : "text-green-500")} />
                      )}
                      <span className={cn(
                        isSudo ? "text-emerald-500/80" : "text-[var(--muted)]"
                      )}>
                        {msg.content}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
              
              {/* Continuous Session Indicator */}
              {(interactionState === 'listening' || interactionState === 'thinking') && messages.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center gap-3 px-2 mt-2"
                >
                  <span className={cn(
                    "text-sm italic",
                    isSudo ? "font-mono text-emerald-500/50 not-italic" : "text-[var(--muted)]"
                  )}>
                    {interactionState === 'thinking' ? 'Processing...' : 'Listening for follow-up...'}
                  </span>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer / Composer */}
      <div className={cn(
        "p-4 border-t transition-all duration-300",
        isSudo ? "border-emerald-500/20 bg-emerald-950/10" : "border-[var(--border)] bg-[var(--bg)]/50"
      )}>
        {interactionState === 'idle' ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-2xl border focus-within:ring-1 transition-all shadow-sm",
              isSudo ? "bg-black border-emerald-500/30 focus-within:border-emerald-400 focus-within:ring-emerald-400/50 rounded-sm" : 
              "bg-[var(--surface)] border-[var(--border)] focus-within:border-[var(--text)] focus-within:ring-[var(--text)]/20"
            )}
          >
            <button className={cn(
              "p-2 rounded-xl transition-colors",
              isSudo ? "text-emerald-500/50 hover:text-emerald-400" : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]"
            )}>
              <Paperclip className="w-4 h-4" />
            </button>
            
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a command..."
              className={cn(
                "flex-1 bg-transparent border-none outline-none text-[15px] px-1",
                isSudo ? "font-mono text-emerald-400 placeholder:text-emerald-500/30" : "text-[var(--text)] placeholder:text-[var(--muted)]"
              )}
            />

            {inputValue.trim() ? (
              <button 
                onClick={handleSend}
                className={cn(
                  "p-2 rounded-xl transition-colors",
                  isSudo ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30" : "bg-[var(--text)] text-[var(--bg)] hover:opacity-90"
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={handleMicClick}
                className={cn(
                  "p-2 rounded-xl transition-colors relative",
                  isSudo ? "text-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/10" : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]"
                )}
              >
                <Mic className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center w-full py-1"
          >
            <button 
              onClick={() => setInteractionState('idle')}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-full transition-all hover:scale-105 shadow-sm",
                isSudo ? "bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20 font-mono text-sm rounded-sm" : 
                "bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg)]"
              )}
            >
              <Square className="w-4 h-4 fill-current" />
              <span className="font-medium text-sm">Interrupt</span>
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
