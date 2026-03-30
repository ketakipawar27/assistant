import { PageHeader } from '@/components/common/PageHeader';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { Download, Search, Star, Zap, Code, Image as ImageIcon, FileText, Database } from 'lucide-react';

const SKILLS = [
  { id: '1', name: 'Advanced Code Analysis', author: 'System', rating: 4.9, installs: '12k', icon: <Code className="w-5 h-5" />, category: 'Development', installed: true },
  { id: '2', name: 'Image Generation Pro', author: 'Community', rating: 4.7, installs: '8.5k', icon: <ImageIcon className="w-5 h-5" />, category: 'Creative', installed: false },
  { id: '3', name: 'Document Summarizer', author: 'System', rating: 4.8, installs: '24k', icon: <FileText className="w-5 h-5" />, category: 'Productivity', installed: true },
  { id: '4', name: 'SQL Query Builder', author: 'Community', rating: 4.5, installs: '3.2k', icon: <Database className="w-5 h-5" />, category: 'Development', installed: false },
  { id: '5', name: 'Web Scraper Lite', author: 'Community', rating: 4.2, installs: '5.1k', icon: <Zap className="w-5 h-5" />, category: 'Utility', installed: false },
];

export function Skills() {
  const persona = useAppStore(s => s.persona);
  const isSudo = persona === 'sudo';

  return (
    <div className="h-full flex flex-col">
      <PageHeader 
        title="Skills" 
        description="Enhance your assistant's capabilities with new skills." 
      />
      
      <div className="flex flex-col gap-6">
        {/* Search and Filter */}
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex-1 relative flex items-center",
            isSudo && "font-mono"
          )}>
            <Search className="w-4 h-4 absolute left-3 text-[var(--muted)]" />
            <input 
              type="text" 
              placeholder="Search skills..." 
              className={cn(
                "w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors",
                isSudo && "rounded-sm border-emerald-500/30 focus:border-emerald-500/70 bg-emerald-500/5 text-emerald-50 placeholder:text-emerald-500/50"
              )}
            />
          </div>
          <div className="flex items-center gap-2">
            {['All', 'Installed', 'Development', 'Productivity'].map(filter => (
              <button key={filter} className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] transition-colors",
                filter === 'All' && "bg-[var(--text)] text-[var(--bg)] border-transparent",
                isSudo && "rounded-sm border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400",
                isSudo && filter === 'All' && "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
              )}>
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SKILLS.map(skill => (
            <div key={skill.id} className={cn(
              "p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm flex flex-col gap-4 transition-all duration-300 hover:border-[var(--accent)]/50 hover:shadow-md group",
              isSudo && "rounded-sm border-emerald-500/20 hover:border-emerald-500/50"
            )}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--bg)] border border-[var(--border)] text-[var(--text)]",
                    isSudo && "rounded-sm border-emerald-500/30 text-emerald-400"
                  )}>
                    {skill.icon}
                  </div>
                  <div>
                    <h3 className={cn("font-medium text-[var(--text)]", isSudo && "font-mono text-emerald-400")}>{skill.name}</h3>
                    <p className="text-xs text-[var(--muted)] mt-0.5">{skill.author}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current text-yellow-500" />
                  <span>{skill.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" />
                  <span>{skill.installs}</span>
                </div>
                <div className={cn(
                  "px-2 py-0.5 rounded-full bg-[var(--bg)] border border-[var(--border)]",
                  isSudo && "rounded-sm border-emerald-500/20 text-emerald-500/70"
                )}>
                  {skill.category}
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-[var(--border)]">
                {skill.installed ? (
                  <button className={cn(
                    "w-full py-2 rounded-lg text-xs font-medium border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--surface)] transition-colors",
                    isSudo && "rounded-sm border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                  )}>
                    Configure
                  </button>
                ) : (
                  <button className={cn(
                    "w-full py-2 rounded-lg text-xs font-medium bg-[var(--text)] text-[var(--bg)] hover:opacity-90 transition-opacity",
                    isSudo && "rounded-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                  )}>
                    Install Skill
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
