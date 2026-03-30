import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { Mic, Paperclip, MonitorUp, Send, Square } from 'lucide-react';
import { useState } from 'react';
import { useRuntimeStore } from '@/store/useRuntimeStore';

export function CommandComposer() {
  const persona = useAppStore(s => s.persona);
  const assistantState = useRuntimeStore(s => s.assistantState);
  const [input, setInput] = useState('');

  const isExecuting = assistantState === 'executing' || assistantState === 'thinking';

  return (
    <div className="p-4 bg-[var(--bg)] border-t border-[var(--border)]">
      <div className="max-w-4xl mx-auto relative">
        <div className={cn(
          "flex items-end gap-2 p-2 bg-[var(--surface)] border rounded-[var(--panel-radius)] shadow-sm transition-colors",
          persona === 'sudo' ? "border-emerald-500/30 focus-within:border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.05)]" : 
          "border-[var(--border)] focus-within:border-[var(--accent)]"
        )}>
          
          {/* Left Actions */}
          <div className="flex items-center gap-1 pb-1 pl-1">
            <button className={cn(
              "p-2 text-[var(--muted)] hover:text-[var(--text)] rounded-[calc(var(--panel-radius)-4px)] transition-colors",
              persona === 'sudo' && "hover:text-emerald-400 hover:bg-emerald-500/10"
            )} title="Attach File">
              <Paperclip className="w-4 h-4" />
            </button>
            <button className={cn(
              "p-2 text-[var(--muted)] hover:text-[var(--text)] rounded-[calc(var(--panel-radius)-4px)] transition-colors",
              persona === 'sudo' && "hover:text-emerald-400 hover:bg-emerald-500/10"
            )} title="Share Screen Context">
              <MonitorUp className="w-4 h-4" />
            </button>
          </div>

          {/* Input Area */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isExecuting ? "Assistant is busy..." :
              persona === 'sudo' ? "Enter command sequence..." : 
              "Ask anything or give a command..."
            }
            disabled={isExecuting}
            className={cn(
              "flex-1 max-h-32 min-h-[40px] py-2.5 px-2 bg-transparent border-none resize-none focus:outline-none text-sm text-[var(--text)] placeholder:text-[var(--muted)]",
              persona === 'sudo' && "font-mono text-emerald-50 placeholder:text-emerald-500/50",
              isExecuting && "opacity-50 cursor-not-allowed"
            )}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (input.trim() && !isExecuting) {
                  setInput('');
                  // Handle send
                }
              }
            }}
          />

          {/* Right Actions */}
          <div className="flex items-center gap-1 pb-1 pr-1">
            {isExecuting ? (
              <button className={cn(
                "p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-[calc(var(--panel-radius)-4px)] transition-colors"
              )} title="Stop Execution">
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <>
                <button className={cn(
                  "p-2 text-[var(--muted)] hover:text-[var(--text)] rounded-[calc(var(--panel-radius)-4px)] transition-colors",
                  persona === 'sudo' && "hover:text-emerald-400 hover:bg-emerald-500/10"
                )} title="Voice Command">
                  <Mic className="w-4 h-4" />
                </button>
                <button 
                  disabled={!input.trim()}
                  className={cn(
                    "p-2 rounded-[calc(var(--panel-radius)-4px)] transition-all",
                    input.trim() 
                      ? persona === 'sudo' ? "bg-emerald-600 text-black hover:bg-emerald-500" : "bg-[var(--accent)] text-white hover:opacity-90"
                      : "bg-[var(--bg)] text-[var(--muted)] cursor-not-allowed"
                  )} 
                  title="Send Command"
                >
                  <Send className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Footer hints */}
        <div className="flex justify-between items-center mt-2 px-2">
          <div className={cn("text-[10px] text-[var(--muted)]", persona === 'sudo' && "font-mono")}>
            Press <kbd className="px-1.5 py-0.5 bg-[var(--surface)] border border-[var(--border)] rounded text-[9px]">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-[var(--surface)] border border-[var(--border)] rounded text-[9px]">Shift + Enter</kbd> for new line
          </div>
          <div className={cn("text-[10px] text-[var(--muted)] flex items-center gap-1", persona === 'sudo' && "font-mono")}>
            <div className={cn("w-1.5 h-1.5 rounded-full", isExecuting ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} />
            {isExecuting ? 'System Busy' : 'System Ready'}
          </div>
        </div>
      </div>
    </div>
  );
}
