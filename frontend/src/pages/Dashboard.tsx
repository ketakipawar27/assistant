import { PageHeader } from '@/components/common/PageHeader';

export function Dashboard() {
  return (
    <div className="h-full flex flex-col">
      <PageHeader 
        title="Dashboard" 
        description="System overview and quick actions." 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder Cards */}
        <div className="p-6 rounded-[var(--panel-radius)] border border-[var(--border)] bg-[var(--surface)] shadow-sm transition-all duration-300">
          <h3 className="font-semibold mb-2">Recent Activity</h3>
          <p className="text-sm text-[var(--muted)]">No recent activity to display.</p>
        </div>
        
        <div className="p-6 rounded-[var(--panel-radius)] border border-[var(--border)] bg-[var(--surface)] shadow-sm transition-all duration-300">
          <h3 className="font-semibold mb-2">Quick Actions</h3>
          <p className="text-sm text-[var(--muted)]">Configure your quick actions.</p>
        </div>
        
        <div className="p-6 rounded-[var(--panel-radius)] border border-[var(--border)] bg-[var(--surface)] shadow-sm transition-all duration-300">
          <h3 className="font-semibold mb-2">System Health</h3>
          <p className="text-sm text-[var(--muted)]">All systems operational.</p>
        </div>
      </div>
    </div>
  );
}
