import { ReactNode } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  const persona = useAppStore((state) => state.persona);

  return (
    <div className="flex items-center justify-between mb-8 pb-6 border-b border-[var(--border)]">
      <div>
        <h1 className={cn(
          "text-3xl font-bold tracking-tight text-[var(--text)]",
          persona === 'sudo' && "font-mono uppercase tracking-wider text-emerald-500"
        )}>
          {persona === 'sudo' ? `> ${title}` : title}
        </h1>
        {description && (
          <p className={cn(
            "mt-2 text-sm text-[var(--muted)]",
            persona === 'sudo' && "font-mono"
          )}>
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
