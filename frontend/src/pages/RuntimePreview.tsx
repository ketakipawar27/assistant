import { PageHeader } from '@/components/common/PageHeader';
import { useRuntimeStore } from '@/store/useRuntimeStore';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { Mic, Image, AlertTriangle, PlaySquare, XOctagon, Activity, MessageSquare } from 'lucide-react';
import { AssistantOrb } from '@/components/runtime/AssistantOrb';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export function RuntimePreview() {
  const persona = useAppStore(s => s.persona);
  const { 
    assistantState, 
    setAssistantState, 
    setVoiceOverlay, 
    setConfirmation, 
    setTaskProgress, 
    setActionResult, 
    setFloatingChat,
    addToast, 
    reset 
  } = useRuntimeStore();

  const simulateVoiceCommand = async () => {
    reset();
    
    // Stage 1: Wake / Ready
    setVoiceOverlay({ isOpen: true, transcript: '', taskPreview: '' });
    setAssistantState('idle');
    await delay(800);

    // Stage 2: Live Listening
    setAssistantState('listening');
    
    const fullTranscript = "Open VS Code and summarize my Downloads folder";
    const words = fullTranscript.split(' ');
    let currentTranscript = '';

    for (let i = 0; i < words.length; i++) {
      currentTranscript += (i === 0 ? '' : ' ') + words[i];
      setVoiceOverlay({ transcript: currentTranscript });
      // Random delay between words for realism
      await delay(150 + Math.random() * 200);
    }

    await delay(600); // Pause after speaking

    // Stage 3: Thinking / Executing / Replying
    setAssistantState('thinking');
    setVoiceOverlay({ taskPreview: 'Parsing intent...' });
    await delay(1200);
    
    setAssistantState('executing');
    setVoiceOverlay({ taskPreview: 'system.openApp' });
    await delay(1000);
    
    setVoiceOverlay({ taskPreview: 'fs.readDirectory' });
    await delay(1000);

    setVoiceOverlay({ taskPreview: 'ai.summarizeDocuments' });
    await delay(1500);

    setAssistantState('completed');
    setVoiceOverlay({ taskPreview: 'VS Code opened. Downloads folder contains 12 files, mostly PDF reports.' });
    
    await delay(3000);
    setVoiceOverlay({ isOpen: false });
    setAssistantState('idle');
  };

  const simulateScreenshot = async () => {
    reset();
    setAssistantState('executing');
    setTaskProgress({
      isOpen: true,
      taskName: 'Capturing Screen',
      progress: 0,
      status: 'running',
      details: 'Preparing capture...'
    });

    await delay(500);
    setTaskProgress({ progress: 45, details: 'Processing image...' });
    
    await delay(800);
    setTaskProgress({ progress: 100, status: 'completed', details: 'Screenshot saved.' });
    setAssistantState('completed');

    await delay(1000);
    setTaskProgress({ isOpen: false });
    setAssistantState('idle');

    setActionResult({
      isOpen: true,
      title: 'Screenshot Captured',
      description: 'Saved to Desktop/Screenshots',
      actionLabel: 'Open Folder',
      onAction: () => addToast({ type: 'info', title: 'Opening Folder...' })
    });

    await delay(4000);
    setActionResult({ isOpen: false });
  };

  const simulateDangerousAction = async () => {
    reset();
    setAssistantState('confirming');
    setConfirmation({
      isOpen: true,
      title: 'Delete duplicate files?',
      message: 'Found 4.2 GB of duplicate files in Downloads. This action cannot be undone.',
      danger: true,
      onConfirm: async () => {
        setAssistantState('executing');
        setTaskProgress({
          isOpen: true,
          taskName: 'Deleting Files',
          progress: 0,
          status: 'running',
          details: 'Removing duplicates...'
        });

        await delay(1000);
        setTaskProgress({ progress: 50, details: 'Cleaning up...' });

        await delay(1000);
        setTaskProgress({ progress: 100, status: 'completed', details: '4.2 GB freed.' });
        setAssistantState('completed');

        await delay(1500);
        setTaskProgress({ isOpen: false });
        setAssistantState('idle');
        addToast({ type: 'success', title: 'Cleanup Complete', message: 'Removed 4.2 GB of duplicate files.' });
      },
      onCancel: () => {
        setAssistantState('idle');
        addToast({ type: 'info', title: 'Action Cancelled' });
      }
    });
  };

  const simulateOpenApp = async () => {
    reset();
    setAssistantState('executing');
    await delay(800);
    setAssistantState('completed');
    addToast({ type: 'success', title: 'Opening VS Code', message: 'Workspace loaded.' });
    await delay(1000);
    setAssistantState('idle');
  };

  const simulateError = async () => {
    reset();
    setAssistantState('executing');
    setTaskProgress({
      isOpen: true,
      taskName: 'Deploying to Production',
      progress: 0,
      status: 'running',
      details: 'Building assets...'
    });

    await delay(1500);
    setTaskProgress({ progress: 34, details: 'Uploading files...' });

    await delay(1000);
    setTaskProgress({ progress: 34, status: 'failed', details: 'Network timeout (ERR_CONNECTION_RESET)' });
    setAssistantState('failed');

    await delay(2000);
    setTaskProgress({ isOpen: false });
    setAssistantState('idle');

    setActionResult({
      isOpen: true,
      title: 'Deployment Failed',
      description: 'Could not connect to the remote server.',
      actionLabel: 'Retry',
      onAction: () => simulateError()
    });
  };

  const simulateFloatingChat = () => {
    setFloatingChat({ isOpen: true, mode: 'collapsed' });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 pb-32">
      <PageHeader 
        title="Runtime Simulator" 
        description="Test connected assistant interaction flows."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className={cn(
            "p-6 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--panel-radius)]",
            persona === 'sudo' && "border-emerald-500/20"
          )}>
            <h3 className={cn("text-sm font-semibold text-[var(--text)] mb-4 uppercase tracking-wider", persona === 'sudo' && "font-mono text-emerald-500")}>
              Scenarios
            </h3>
            <div className="space-y-3">
              <ScenarioButton icon={MessageSquare} label="Floating Chat" onClick={simulateFloatingChat} />
              <ScenarioButton icon={Mic} label="Voice Command" onClick={simulateVoiceCommand} />
              <ScenarioButton icon={Image} label="Screenshot Action" onClick={simulateScreenshot} />
              <ScenarioButton icon={AlertTriangle} label="Dangerous Action" onClick={simulateDangerousAction} />
              <ScenarioButton icon={PlaySquare} label="Open App" onClick={simulateOpenApp} />
              <ScenarioButton icon={XOctagon} label="Error State" onClick={simulateError} />
            </div>
          </div>

          <div className={cn(
            "p-6 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--panel-radius)]",
            persona === 'sudo' && "border-emerald-500/20"
          )}>
            <h3 className={cn("text-sm font-semibold text-[var(--text)] mb-4 uppercase tracking-wider", persona === 'sudo' && "font-mono text-emerald-500")}>
              System State
            </h3>
            <div className="flex items-center gap-4">
              <Activity className={cn("w-5 h-5", persona === 'sudo' ? "text-emerald-500" : "text-[var(--accent)]")} />
              <div>
                <div className="text-xs text-[var(--muted)] uppercase tracking-wider">Current Status</div>
                <div className={cn("text-sm font-medium text-[var(--text)] capitalize", persona === 'sudo' && "font-mono")}>
                  {assistantState}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Area */}
        <div className="lg:col-span-2">
          <div className={cn(
            "h-[600px] relative bg-[var(--bg)] border border-[var(--border)] rounded-[var(--panel-radius)] overflow-hidden flex flex-col items-center justify-center",
            persona === 'sudo' && "border-emerald-500/20"
          )}>
            {/* Background Grid for visual interest */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            
            <div className="relative z-10 flex flex-col items-center gap-8">
              <AssistantOrb state={assistantState} size="lg" />
              <div className={cn(
                "px-4 py-2 rounded-full bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--muted)] shadow-sm",
                persona === 'sudo' && "font-mono text-xs border-emerald-500/30"
              )}>
                Assistant is {assistantState}
              </div>
            </div>

            <div className="absolute bottom-4 left-4 text-xs text-[var(--muted)] font-mono opacity-50">
              Persona: {persona.toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScenarioButton({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) {
  const persona = useAppStore(s => s.persona);
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-[calc(var(--panel-radius)-4px)] text-sm font-medium text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all text-left",
        persona === 'sudo' && "font-mono hover:border-emerald-500 hover:text-emerald-400"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
