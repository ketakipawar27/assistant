import { motion, AnimatePresence } from 'motion/react';
import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationToastProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const icons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

const colors = {
  info: 'text-blue-400',
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  error: 'text-red-400',
};

export function NotificationToast({ toasts, onRemove }: NotificationToastProps) {
  const persona = useAppStore(s => s.persona);

  return (
    <div className="fixed top-6 right-6 z-[120] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={cn(
                "w-[320px] p-4 bg-[var(--surface)]/95 backdrop-blur-md border border-[var(--border)] shadow-xl flex gap-3 pointer-events-auto",
                "rounded-[var(--panel-radius)]",
                persona === 'sudo' && "border-emerald-500/20 shadow-[0_4px_20px_rgba(16,185,129,0.1)]"
              )}
            >
              <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", colors[toast.type])} />
              <div className="flex-1 min-w-0">
                <h4 className={cn("text-sm font-semibold text-[var(--text)] truncate", persona === 'sudo' && "font-mono")}>
                  {toast.title}
                </h4>
                {toast.message && (
                  <p className={cn("text-xs text-[var(--muted)] mt-1 line-clamp-2", persona === 'sudo' && "font-mono text-[10px]")}>
                    {toast.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => onRemove(toast.id)}
                className="p-1 text-[var(--muted)] hover:text-[var(--text)] transition-colors self-start"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// Helper hook to manage toasts
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);

    if (toast.duration !== Infinity) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, removeToast };
}
