import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { CommandComposer } from '@/components/chat/CommandComposer';
import { 
  ToolExecutionCard, 
  ResultCard, 
  FileSummaryCard, 
  ConfirmationRequestCard, 
  SuggestionChips 
} from '@/components/chat/RichMessageBlocks';
import { useAppStore } from '@/store/useAppStore';
import { useRuntimeStore } from '@/store/useRuntimeStore';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

export function Chat() {
  const persona = useAppStore(s => s.persona);
  const assistantState = useRuntimeStore(s => s.assistantState);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [assistantState]);

  return (
    <div className="flex flex-col h-full bg-[var(--bg)] relative overflow-hidden">
      {/* Background styling for SUDO mode */}
      {persona === 'sudo' && (
        <div className="absolute inset-0 pointer-events-none z-0 opacity-5">
          <div className="w-full h-full bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),linear-gradient(to_bottom,#10b981_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
      )}

      <ChatHeader />

      {/* Main Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 scroll-smooth z-10"
      >
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
          
          {/* Mock Conversation History */}
          <ChatMessage role="user" content="Open VS Code and launch my portfolio project" timestamp="10:42 AM" />
          
          <ChatMessage role="assistant" timestamp="10:42 AM">
            <ToolExecutionCard name="system.openApp" status="completed" details="Launched Visual Studio Code" />
            <ToolExecutionCard name="system.executeCommand" status="completed" details="cd ~/Projects/portfolio && code ." />
            <ResultCard title="Workspace Ready" description="I've opened your portfolio project in VS Code." iconType="success" />
          </ChatMessage>

          <ChatMessage role="user" content="Summarize the files in Downloads" timestamp="10:45 AM" />

          <ChatMessage role="assistant" timestamp="10:45 AM">
            <ToolExecutionCard name="fs.readDirectory" status="completed" details="Scanned ~/Downloads (12 files found)" />
            <ToolExecutionCard name="ai.summarizeDocuments" status="completed" details="Processed 3 PDF documents" />
            <FileSummaryCard 
              files={[
                { name: 'Q3_Financial_Report.pdf', size: '2.4 MB' },
                { name: 'Project_Proposal_v2.pdf', size: '1.1 MB' },
                { name: 'Meeting_Notes_Oct.pdf', size: '450 KB' }
              ]}
              summary="The downloads folder contains recent financial reports and project proposals. The Q3 report highlights a 15% revenue increase, while the proposal outlines the new Q4 marketing strategy."
            />
            <SuggestionChips suggestions={['Move to Documents', 'Delete PDFs', 'Extract Action Items']} />
          </ChatMessage>

          <ChatMessage role="user" content="Do you want me to delete these 12 duplicate files?" timestamp="10:48 AM" />

          <ChatMessage role="assistant" timestamp="10:48 AM">
            <ToolExecutionCard name="fs.findDuplicates" status="completed" details="Found 12 duplicate files (4.2 GB total)" />
            <ConfirmationRequestCard 
              title="Delete Duplicate Files" 
              message="I found 12 duplicate files taking up 4.2 GB of space in your Downloads folder. Do you want me to permanently delete them?"
            />
          </ChatMessage>

          <ChatMessage role="user" content="Take a screenshot and copy it" timestamp="10:51 AM" />

          <ChatMessage role="assistant" timestamp="10:51 AM">
            <ToolExecutionCard name="system.captureScreen" status="completed" details="Captured display 1 (1920x1080)" />
            <ToolExecutionCard name="system.copyToClipboard" status="completed" details="Image copied to clipboard" />
            <ResultCard title="Screenshot Copied" description="The screenshot has been taken and copied to your clipboard. You can paste it anywhere." iconType="info" />
          </ChatMessage>

          {/* Active State Simulation (if executing) */}
          {assistantState === 'executing' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <ChatMessage role="assistant" timestamp="Just now">
                <ToolExecutionCard name="system.runningTask" status="running" details="Processing your request..." />
              </ChatMessage>
            </motion.div>
          )}
          
          {assistantState === 'thinking' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <ChatMessage role="assistant" timestamp="Just now">
                <div className={cn(
                  "flex items-center gap-2 text-sm text-[var(--muted)] italic",
                  persona === 'sudo' && "font-mono text-emerald-500/70"
                )}>
                  <span className="animate-pulse">Analyzing request...</span>
                </div>
              </ChatMessage>
            </motion.div>
          )}

        </div>
      </div>

      {/* Command Input Area */}
      <div className="z-10">
        <CommandComposer />
      </div>
    </div>
  );
}
