import { useRuntimeStore } from '@/store/useRuntimeStore';
import { FloatingVoiceAssistant } from './FloatingVoiceAssistant';
import { ConfirmationPanel } from './ConfirmationPanel';
import { TaskProgressPanel } from './TaskProgressPanel';
import { ActionResultCard } from './ActionResultCard';
import { NotificationToast } from './NotificationToast';
import { FloatingChat } from './FloatingChat';
import { AnimatePresence } from 'motion/react';

export function GlobalRuntime() {
  const { 
    assistantState, 
    voiceOverlay, 
    confirmation, 
    taskProgress, 
    actionResult,
    toasts,
    setVoiceOverlay,
    setConfirmation,
    setActionResult,
    removeToast
  } = useRuntimeStore();

  return (
    <>
      {/* Floating Chat Layer */}
      <FloatingChat />

      {/* Voice Overlay */}
      <AnimatePresence>
        {voiceOverlay.isOpen && (
          <div className="fixed inset-x-0 bottom-12 z-[100] flex justify-center pointer-events-none">
            <div className="pointer-events-auto">
              <FloatingVoiceAssistant 
                state={assistantState}
                transcript={voiceOverlay.transcript}
                taskPreview={voiceOverlay.taskPreview}
                onClose={() => setVoiceOverlay({ isOpen: false })}
                onStop={() => {
                  useRuntimeStore.getState().setAssistantState('idle');
                  setVoiceOverlay({ isOpen: false });
                }}
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Panel */}
      <AnimatePresence>
        {confirmation.isOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <ConfirmationPanel
              title={confirmation.title}
              message={confirmation.message}
              danger={confirmation.danger}
              onConfirm={() => {
                confirmation.onConfirm?.();
                setConfirmation({ isOpen: false });
              }}
              onCancel={() => {
                confirmation.onCancel?.();
                setConfirmation({ isOpen: false });
              }}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Fixed bottom-right area for Task Progress and Action Results */}
      <div className="fixed bottom-6 right-6 z-[90] flex flex-col gap-4 items-end pointer-events-none">
        <AnimatePresence>
          {taskProgress.isOpen && (
            <div className="pointer-events-auto">
              <TaskProgressPanel
                taskName={taskProgress.taskName}
                progress={taskProgress.progress}
                status={taskProgress.status}
                details={taskProgress.details}
              />
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {actionResult.isOpen && (
            <div className="pointer-events-auto">
              <ActionResultCard
                title={actionResult.title}
                description={actionResult.description}
                actionLabel={actionResult.actionLabel}
                onAction={() => {
                  actionResult.onAction?.();
                  setActionResult({ isOpen: false });
                }}
              />
            </div>
          )}
        </AnimatePresence>
      </div>

      <NotificationToast toasts={toasts} onRemove={removeToast} />
    </>
  );
}
