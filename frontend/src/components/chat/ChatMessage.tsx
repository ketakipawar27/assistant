import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { User, BrainCircuit, TerminalSquare } from 'lucide-react';
import React from 'react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content?: string;
  children?: React.ReactNode;
  timestamp?: string;
}

export function ChatMessage({ role, content, children, timestamp }: ChatMessageProps) {
  const persona = useAppStore(s => s.persona);
  const isUser = role === 'user';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-4 w-full max-w-4xl mx-auto py-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
        isUser ? "bg-[var(--surface)] border border-[var(--border)]" : 
        persona === 'titan' ? "bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.3)]" :
        persona === 'astra' ? "bg-purple-600 shadow-[0_0_15px_rgba(192,132,252,0.3)]" :
        "bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)] rounded-sm border border-emerald-400/30"
      )}>
        {isUser ? (
          <User className="w-4 h-4 text-[var(--muted)]" />
        ) : persona === 'sudo' ? (
          <TerminalSquare className="w-4 h-4 text-emerald-50" />
        ) : (
          <BrainCircuit className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        "flex flex-col gap-2 max-w-[80%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className="flex items-center gap-2 px-1">
          <span className={cn(
            "text-xs font-medium",
            isUser ? "text-[var(--muted)]" : 
            persona === 'sudo' ? "text-emerald-500 font-mono" : "text-[var(--accent)]"
          )}>
            {isUser ? 'You' : persona === 'titan' ? 'TITAN' : persona === 'astra' ? 'Astra' : 'root'}
          </span>
          {timestamp && (
            <span className="text-[10px] text-[var(--muted)] opacity-50">{timestamp}</span>
          )}
        </div>

        {content && (
          <div className={cn(
            "px-4 py-3 rounded-[var(--panel-radius)] text-sm leading-relaxed",
            isUser ? "bg-[var(--surface)] border border-[var(--border)] text-[var(--text)]" :
            persona === 'sudo' ? "bg-transparent border border-emerald-500/20 text-emerald-50 font-mono" :
            "bg-[var(--bg)] border border-[var(--border)] text-[var(--text)]"
          )}>
            {content}
          </div>
        )}

        {/* Rich Blocks (Tools, Results, etc) */}
        {children && (
          <div className="flex flex-col w-full mt-1">
            {children}
          </div>
        )}
      </div>
    </motion.div>
  );
}
