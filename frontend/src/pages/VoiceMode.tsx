import { PageHeader } from '@/components/common/PageHeader';
import { useAppStore } from '@/store/useAppStore';
import { useRuntimeStore } from '@/store/useRuntimeStore';
import { cn } from '@/lib/utils';
import { Mic, Square, Settings2, Activity, Volume2, History, CheckCircle2, CircleDashed, Loader2, Maximize2, MessageSquare, MicOff, AlertTriangle } from 'lucide-react';
import { AssistantOrb } from '@/components/runtime/AssistantOrb';
import { VoiceWaveform } from '@/components/runtime/VoiceWaveform';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function VoiceMode() {
  const persona = useAppStore(s => s.persona);
  const isSudo = persona === 'sudo';
  const { assistantState, setAssistantState, setFloatingChat } = useRuntimeStore();
  const navigate = useNavigate();

  const [localTranscript, setLocalTranscript] = useState('');
  const [parsedIntent, setParsedIntent] = useState('');
  const [recentCommands, setRecentCommands] = useState([
    { id: 1, text: 'Turn on Do Not Disturb', time: '10m ago' },
    { id: 2, text: 'What is my next meeting?', time: '1h ago' }
  ]);

  const isListening = assistantState === 'listening';
  const isThinking = assistantState === 'thinking';
  const isExecuting = assistantState === 'executing';
  const isCompleted = assistantState === 'completed';
  const isError = assistantState === 'failed';

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (useRuntimeStore.getState().assistantState !== 'idle') {
        useRuntimeStore.getState().setAssistantState('idle');
      }
    };
  }, []);

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const handleMicClick = async () => {
    if (isListening || isExecuting || isThinking) {
      // Interrupt
      setAssistantState('idle');
      setLocalTranscript('');
      setParsedIntent('');
      return;
    }

    setAssistantState('listening');
    setLocalTranscript('');
    setParsedIntent('');

    const text = "Open VS Code and summarize my Downloads folder";
    const words = text.split(' ');
    let current = '';
    for (let i = 0; i < words.length; i++) {
      if (useRuntimeStore.getState().assistantState !== 'listening') return; // Interrupted
      current += (i === 0 ? '' : ' ') + words[i];
      setLocalTranscript(current);
      await delay(200 + Math.random() * 100);
    }

    await delay(500);
    if (useRuntimeStore.getState().assistantState !== 'listening') return;

    setAssistantState('thinking');
    await delay(800);
    if (useRuntimeStore.getState().assistantState !== 'thinking') return;

    setParsedIntent('Summarize local directory (~/Downloads)');
    await delay(1000);
    if (useRuntimeStore.getState().assistantState !== 'thinking') return;

    setAssistantState('executing');

    await delay(1500);
    if (useRuntimeStore.getState().assistantState !== 'executing') return;

    await delay(1500);
    if (useRuntimeStore.getState().assistantState !== 'executing') return;

    await delay(2000);
    if (useRuntimeStore.getState().assistantState !== 'executing') return;

    setAssistantState('completed');
    setRecentCommands(prev => [{ id: Date.now(), text, time: 'Just now' }, ...prev].slice(0, 5));

    await delay(3000);
    if (useRuntimeStore.getState().assistantState !== 'completed') return;
    setAssistantState('idle');
  };

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto w-full px-6 pb-6">
      <PageHeader 
        title={isSudo ? "VOICE INTERFACE" : "Voice Mode"} 
        description={isSudo ? "Hands-free terminal access." : "Hands-free interaction and continuous listening."} 
      />
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Column: Hero */}
        <div className="lg:col-span-8 flex flex-col min-h-0">
          
          {/* 1. Hero Voice Stage */}
          <div className={cn(
            "flex-1 rounded-[var(--panel-radius)] border border-[var(--border)] bg-[var(--surface)] shadow-sm flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden min-h-[500px]",
            isSudo && "border-emerald-500/20"
          )}>
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            {/* Ambient Glow */}
            {(isListening || isThinking || isExecuting) && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "absolute inset-0 blur-3xl",
                  isExecuting ? "opacity-5" : "opacity-10",
                  isSudo ? "bg-emerald-500" : persona === 'titan' ? "bg-blue-500" : "bg-purple-500"
                )}
              />
            )}

            {/* Status Indicator */}
            <div className="absolute top-6 left-6 flex items-center gap-3 z-20">
              <StatusChip state={assistantState} isSudo={isSudo} />
              {(isListening || isThinking || isExecuting) && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn("text-xs flex items-center gap-1.5", isSudo ? "text-emerald-500/70 font-mono" : "text-[var(--muted)]")}
                >
                  Press <kbd className={cn("px-1.5 py-0.5 rounded text-[10px] font-sans font-medium", isSudo ? "bg-emerald-500/20 text-emerald-400" : "bg-[var(--border)] text-[var(--text)]")}>ESC</kbd> to interrupt
                </motion.span>
              )}
            </div>

            <div className="relative z-10 flex flex-col items-center w-full h-full max-w-3xl px-4 md:px-8 py-6 md:py-12">
              
              {/* Spacer */}
              <div className="flex-1 min-h-[1rem] max-h-[2rem]" />

              {/* Main Visualizer */}
              <div className="h-32 flex items-center justify-center w-full relative shrink-0">
                {isListening && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className={cn(
                      "absolute inset-0 rounded-full blur-3xl",
                      isSudo ? "bg-emerald-500/20" : persona === 'titan' ? "bg-blue-500/20" : "bg-purple-500/20"
                    )}
                  />
                )}
                <AnimatePresence mode="wait">
                  {isListening ? (
                    <motion.div
                      key="waveform"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="w-full flex justify-center relative z-10"
                    >
                      <VoiceWaveform state="listening" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="orb"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <AssistantOrb state={assistantState} size="lg" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Spacer */}
              <div className="flex-1 min-h-[1rem] max-h-[4rem]" />

              {/* Transcript Area */}
              <div className="min-h-[4rem] flex items-center justify-center w-full text-center px-4 shrink-0">
                <AnimatePresence mode="wait">
                  {isListening ? (
                    <motion.div
                      key="transcript"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={cn(
                        "text-2xl font-medium text-[var(--text)]/90 leading-relaxed tracking-tight max-w-2xl mx-auto",
                        isSudo && "font-mono text-emerald-400/90 text-xl tracking-normal"
                      )}
                    >
                      {localTranscript || (isSudo ? 'Awaiting command input_' : 'I\'m listening...')}
                      {localTranscript && (
                        <motion.span 
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ repeat: Infinity, duration: 0.8 }}
                          className={cn("w-2.5 h-7 bg-current inline-block ml-2 align-middle", isSudo ? "bg-emerald-400" : "bg-[var(--text)]")}
                        />
                      )}
                    </motion.div>
                  ) : isThinking ? (
                    <motion.div
                      key="thinking"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={cn(
                        "text-2xl text-[var(--muted)] italic font-medium",
                        isSudo && "font-mono text-emerald-500/70 not-italic"
                      )}
                    >
                      {localTranscript}
                    </motion.div>
                  ) : isExecuting ? (
                    <motion.div
                      key="executing"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={cn(
                        "text-xl text-[var(--text)] font-semibold tracking-wide",
                        isSudo && "font-mono text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                      )}
                    >
                      {isSudo ? 'Executing command sequence...' : 'Working on that...'}
                    </motion.div>
                  ) : isCompleted ? (
                    <motion.div
                      key="completed"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col items-center gap-4"
                    >
                      <div className={cn(
                        "text-xl text-[var(--text)] font-medium",
                        isSudo && "font-mono text-emerald-400"
                      )}>
                        {isSudo ? 'Execution completed successfully.' : 'Task completed.'}
                      </div>
                      <div className={cn(
                        "text-sm px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] flex items-center gap-2 shadow-sm",
                        isSudo && "font-mono text-xs rounded-sm border-emerald-500/20 bg-emerald-500/5 text-emerald-500/80"
                      )}>
                        <CheckCircle2 className={cn("w-4 h-4", isSudo ? "text-emerald-500" : "text-green-500")} />
                        <span>Summarized 12 files in ~/Downloads</span>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex flex-col items-center"
                    >
                      <div className={cn(
                        "text-xl text-[var(--muted)] font-medium tracking-tight",
                        isSudo && "font-mono text-emerald-500/50 tracking-normal text-lg"
                      )}>
                        {isSudo ? 'Awaiting voice input_' : `Tap the microphone or say "Hey ${persona === 'titan' ? 'Titan' : 'Astra'}"`}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Spacer */}
              <div className="flex-1 min-h-[1.5rem] max-h-[5rem]" />

              {/* Controls */}
              <div className="flex items-center justify-center z-20 shrink-0">
                <div className="relative">
                  {isListening && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: [0, 0.5, 0], scale: [1, 1.5, 2] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                      className={cn(
                        "absolute inset-0 rounded-full",
                        isSudo ? "bg-emerald-500" : "bg-red-500"
                      )}
                    />
                  )}
                  {!isListening && !isExecuting && !isThinking && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: [0, 0.1, 0], scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                      className={cn(
                        "absolute inset-0 rounded-full",
                        isSudo ? "bg-emerald-500" : "bg-[var(--text)]"
                      )}
                    />
                  )}
                  <button 
                    onClick={handleMicClick}
                    className={cn(
                      "relative w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl z-10",
                      (isListening || isExecuting || isThinking)
                        ? (isSudo ? "bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500/30" : "bg-red-500/20 border-2 border-red-500 text-red-500 hover:bg-red-500/30")
                        : (isSudo ? "bg-emerald-600 text-emerald-50 hover:bg-emerald-500 rounded-sm" : "bg-[var(--text)] text-[var(--bg)] hover:scale-105")
                    )}
                  >
                    {(isListening || isExecuting || isThinking) ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-8 h-8" />}
                  </button>
                </div>
              </div>

              {/* Spacer */}
              <div className="flex-1 min-h-[1.5rem] max-h-[5rem]" />

              {/* Suggestion Chips */}
              <div className="flex items-start justify-center w-full shrink-0">
                <AnimatePresence>
                  {assistantState === 'idle' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex flex-col items-center gap-3 w-full"
                    >
                      <div className="flex flex-wrap justify-center gap-3">
                        {[
                          "Summarize my unread emails",
                          "Open Figma and create a new file"
                        ].map((suggestion, i) => (
                          <div 
                            key={i}
                            className={cn(
                              "text-sm px-4 py-2 rounded-full border border-[var(--border)] bg-transparent text-[var(--muted)]/70 cursor-pointer hover:text-[var(--text)] hover:border-[var(--text)]/50 hover:bg-[var(--surface)] transition-all hover:scale-105 active:scale-95",
                              isSudo && "font-mono text-[10px] rounded-sm border-emerald-500/10 bg-transparent text-emerald-500/40 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/5"
                            )}
                          >
                            "{suggestion}"
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-center">
                        <div 
                          className={cn(
                            "text-sm px-4 py-2 rounded-full border border-[var(--border)] bg-transparent text-[var(--muted)]/70 cursor-pointer hover:text-[var(--text)] hover:border-[var(--text)]/50 hover:bg-[var(--surface)] transition-all hover:scale-105 active:scale-95",
                            isSudo && "font-mono text-[10px] rounded-sm border-emerald-500/10 bg-transparent text-emerald-500/40 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/5"
                          )}
                        >
                          "What's on my calendar today?"
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Spacer */}
              <div className="flex-1 min-h-[1rem] max-h-[2rem]" />

            </div>
          </div>

        </div>

        {/* Right Column: Transcript + Controls */}
        <div className="lg:col-span-4 flex flex-col gap-6 min-h-0">
          
          {/* 2. Live Transcript Panel */}
          <div className={cn(
            "flex-1 flex flex-col rounded-[var(--panel-radius)] border border-[var(--border)] bg-[var(--surface)] shadow-sm overflow-hidden",
            isSudo && "border-emerald-500/20"
          )}>
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <h3 className={cn("text-sm font-medium flex items-center gap-2", isSudo && "font-mono text-emerald-500")}>
                <Volume2 className="w-4 h-4 text-[var(--muted)]" />
                Live Context
              </h3>
              <span className={cn("text-xs text-[var(--muted)] flex items-center gap-1.5", isSudo && "font-mono")}>
                {isListening && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                {isListening ? 'Listening now' : 'Last heard 2s ago'}
              </span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-6">
              
              {/* Parsed Intent */}
              <AnimatePresence>
                {parsedIntent && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={cn(
                      "p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)]",
                      isSudo && "border-emerald-500/30 bg-emerald-500/5 rounded-sm"
                    )}>
                      <div className={cn("text-xs text-[var(--muted)] mb-1 uppercase tracking-wider", isSudo && "font-mono text-emerald-500/70")}>Interpreted Intent</div>
                      <div className={cn("text-sm font-medium text-[var(--text)]", isSudo && "font-mono text-emerald-400")}>{parsedIntent}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Recent History */}
              <div className="space-y-3">
                <div className={cn("text-xs text-[var(--muted)] uppercase tracking-wider mb-2", isSudo && "font-mono text-emerald-500/70")}>Recent Commands</div>
                {recentCommands.map(cmd => (
                  <div key={cmd.id} className="flex items-start gap-3 text-sm group">
                    <History className="w-4 h-4 text-[var(--muted)] mt-0.5 group-hover:text-[var(--accent)] transition-colors" />
                    <div className="flex-1">
                      <div className={cn("text-[var(--text)]", isSudo && "font-mono text-emerald-100/80")}>{cmd.text}</div>
                      <div className={cn("text-xs text-[var(--muted)] mt-0.5", isSudo && "font-mono")}>{cmd.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Voice Controls / Device Panel */}
          <div className={cn(
            "rounded-[var(--panel-radius)] border border-[var(--border)] bg-[var(--surface)] shadow-sm p-4 space-y-4",
            isSudo && "border-emerald-500/20"
          )}>
            <h3 className={cn("text-sm font-medium flex items-center gap-2 mb-4", isSudo && "font-mono text-emerald-500")}>
              <Settings2 className="w-4 h-4 text-[var(--muted)]" />
              Device & Controls
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className={cn("text-[var(--muted)]", isSudo && "font-mono")}>Microphone</span>
                <span className={cn("text-[var(--text)] truncate max-w-[120px]", isSudo && "font-mono text-emerald-400")}>MacBook Pro Mic</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={cn("text-[var(--muted)]", isSudo && "font-mono")}>Wake Phrase</span>
                <span className={cn("text-green-500 font-medium", isSudo && "font-mono")}>Enabled</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={cn("text-[var(--muted)]", isSudo && "font-mono")}>Continuous Listen</span>
                <span className={cn("text-[var(--text)]", isSudo && "font-mono text-emerald-400")}>Off</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border)] grid grid-cols-2 gap-2">
              <button onClick={() => navigate('/chat')} className={cn(
                "flex items-center justify-center gap-2 p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors text-xs font-medium text-[var(--text)]",
                isSudo && "font-mono rounded-sm hover:border-emerald-500 hover:text-emerald-400"
              )}>
                <MessageSquare className="w-3.5 h-3.5" />
                Chat
              </button>
              <button onClick={() => setFloatingChat({isOpen: true, mode: 'collapsed'})} className={cn(
                "flex items-center justify-center gap-2 p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors text-xs font-medium text-[var(--text)]",
                isSudo && "font-mono rounded-sm hover:border-emerald-500 hover:text-emerald-400"
              )}>
                <Maximize2 className="w-3.5 h-3.5" />
                Overlay
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatusChip({ state, isSudo }: { state: string, isSudo: boolean }) {
  const isListening = state === 'listening';
  const isThinking = state === 'thinking';
  const isExecuting = state === 'executing';
  const isError = state === 'failed';

  let label = 'Ready';
  let colorClass = 'bg-[var(--bg)] text-[var(--muted)] border-[var(--border)]';
  let dotClass = '';

  if (isListening) {
    label = isSudo ? 'CAPTURING AUDIO' : 'Listening';
    colorClass = isSudo ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-red-500/10 text-red-500 border-red-500/20';
    dotClass = isSudo ? 'bg-emerald-500' : 'bg-red-500';
  } else if (isThinking) {
    label = isSudo ? 'PROCESSING' : 'Thinking';
    colorClass = isSudo ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    dotClass = isSudo ? 'bg-emerald-500' : 'bg-blue-500';
  } else if (isExecuting) {
    label = isSudo ? 'EXECUTING' : 'Executing';
    colorClass = isSudo ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    dotClass = isSudo ? 'bg-emerald-500' : 'bg-purple-500';
  } else if (isError) {
    label = isSudo ? 'ERR_FAILURE' : 'Error';
    colorClass = 'bg-red-500/10 text-red-500 border-red-500/30';
    dotClass = 'bg-red-500';
  } else {
    label = isSudo ? 'SYSTEM READY' : 'Ready';
    if (isSudo) colorClass = 'bg-emerald-500/5 text-emerald-500/50 border-emerald-500/20 font-mono rounded-sm';
  }

  return (
    <div className={cn(
      "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors shadow-sm flex items-center gap-2 border",
      colorClass
    )}>
      {dotClass && (
        <motion.div 
          animate={{ opacity: [1, 0.5, 1] }} 
          transition={{ repeat: Infinity, duration: 1.5 }} 
          className={cn("w-2 h-2 rounded-full", dotClass)} 
        />
      )}
      {label}
    </div>
  );
}
