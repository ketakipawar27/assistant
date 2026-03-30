import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Mic, 
  Zap, 
  Wrench, 
  FolderOpen, 
  BrainCircuit, 
  History, 
  Blocks, 
  Settings,
  TerminalSquare,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Chat', path: '/chat', icon: MessageSquare },
  { name: 'Voice Mode', path: '/voice', icon: Mic },
  { name: 'Automations', path: '/automations', icon: Zap },
  { name: 'Skills', path: '/skills', icon: Wrench },
  { name: 'Files', path: '/files', icon: FolderOpen },
  { name: 'Memory', path: '/memory', icon: BrainCircuit },
  { name: 'History', path: '/history', icon: History },
  { name: 'Integrations', path: '/integrations', icon: Blocks },
  { name: 'Runtime Preview', path: '/preview', icon: Eye },
];

export function Sidebar() {
  const persona = useAppStore((state) => state.persona);
  
  const getLogoStyle = () => {
    if (persona === 'titan') return "bg-blue-600 shadow-blue-900/50 rounded-lg";
    if (persona === 'astra') return "bg-purple-600 shadow-purple-900/50 rounded-full";
    if (persona === 'sudo') return "bg-emerald-600 shadow-emerald-900/50 rounded-sm border border-emerald-400/30";
    return "";
  };

  const getLogoIcon = () => {
    if (persona === 'sudo') return <TerminalSquare className="w-5 h-5 text-emerald-50" />;
    return <BrainCircuit className="w-5 h-5 text-white" />;
  };

  const getLogoText = () => {
    if (persona === 'titan') return 'TITAN.OS';
    if (persona === 'astra') return 'Astra';
    if (persona === 'sudo') return 'root@sudo:~#';
    return '';
  };

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col h-full border-r border-[var(--border)] bg-[var(--surface)] transition-colors duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className={cn(
          "w-8 h-8 flex items-center justify-center shadow-lg transition-all duration-500",
          getLogoStyle()
        )}>
          {getLogoIcon()}
        </div>
        <span className={cn(
          "font-semibold text-lg tracking-tight",
          persona === 'sudo' && "font-mono text-emerald-400 text-sm tracking-wider"
        )}>
          {getLogoText()}
        </span>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200",
              "rounded-[var(--panel-radius)]",
              isActive 
                ? "bg-[var(--border)] text-[var(--accent)]" 
                : "text-[var(--muted)] hover:bg-[var(--border)]/50 hover:text-[var(--text)]",
              persona === 'sudo' && "font-mono text-xs uppercase tracking-wider"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <NavLink
          to="/settings"
          className={({ isActive }) => cn(
            "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200",
            "rounded-[var(--panel-radius)]",
            isActive 
              ? "bg-[var(--border)] text-[var(--accent)]" 
              : "text-[var(--muted)] hover:bg-[var(--border)]/50 hover:text-[var(--text)]",
            persona === 'sudo' && "font-mono text-xs uppercase tracking-wider"
          )}
        >
          <Settings className="w-4 h-4" />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
