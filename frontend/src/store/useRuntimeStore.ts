import { create } from 'zustand';
import { AssistantState } from '@/components/runtime/AssistantOrb';
import { Toast } from '@/components/runtime/NotificationToast';

interface VoiceOverlayState {
  isOpen: boolean;
  transcript?: string;
  taskPreview?: string;
}

interface ConfirmationState {
  isOpen: boolean;
  title: string;
  message: string;
  danger?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface TaskProgressState {
  isOpen: boolean;
  taskName: string;
  progress: number;
  status: 'running' | 'completed' | 'failed';
  details?: string;
}

interface ActionResultState {
  isOpen: boolean;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface FloatingChatState {
  isOpen: boolean;
  mode: 'collapsed' | 'popup' | 'expanded';
}

interface RuntimeState {
  assistantState: AssistantState;
  voiceOverlay: VoiceOverlayState;
  confirmation: ConfirmationState;
  taskProgress: TaskProgressState;
  actionResult: ActionResultState;
  floatingChat: FloatingChatState;
  toasts: Toast[];

  setAssistantState: (state: AssistantState) => void;
  setVoiceOverlay: (state: Partial<VoiceOverlayState>) => void;
  setConfirmation: (state: Partial<ConfirmationState>) => void;
  setTaskProgress: (state: Partial<TaskProgressState>) => void;
  setActionResult: (state: Partial<ActionResultState>) => void;
  setFloatingChat: (state: Partial<FloatingChatState>) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  reset: () => void;
}

export const useRuntimeStore = create<RuntimeState>((set) => ({
  assistantState: 'idle',
  voiceOverlay: { isOpen: false },
  confirmation: { isOpen: false, title: '', message: '' },
  taskProgress: { isOpen: false, taskName: '', progress: 0, status: 'running' },
  actionResult: { isOpen: false, title: '', description: '' },
  floatingChat: { isOpen: false, mode: 'collapsed' },
  toasts: [],

  setAssistantState: (state) => set({ assistantState: state }),
  setVoiceOverlay: (state) => set((s) => ({ voiceOverlay: { ...s.voiceOverlay, ...state } })),
  setConfirmation: (state) => set((s) => ({ confirmation: { ...s.confirmation, ...state } })),
  setTaskProgress: (state) => set((s) => ({ taskProgress: { ...s.taskProgress, ...state } })),
  setActionResult: (state) => set((s) => ({ actionResult: { ...s.actionResult, ...state } })),
  setFloatingChat: (state) => set((s) => ({ floatingChat: { ...s.floatingChat, ...state } })),
  
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    if (toast.duration !== Infinity) {
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter(t => t.id !== id) }));
      }, toast.duration || 5000);
    }
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter(t => t.id !== id) })),
  
  reset: () => set({
    assistantState: 'idle',
    voiceOverlay: { isOpen: false },
    confirmation: { isOpen: false, title: '', message: '' },
    taskProgress: { isOpen: false, taskName: '', progress: 0, status: 'running' },
    actionResult: { isOpen: false, title: '', description: '' },
  })
}));
