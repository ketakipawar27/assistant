import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/ui/StateBlocks';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { FileText, Search, Filter, UploadCloud, FileImage, FileCode, MoreVertical, Sparkles } from 'lucide-react';
import { useState } from 'react';

export function Files() {
  const persona = useAppStore(s => s.persona);
  const isSudo = persona === 'sudo';
  const [hasFiles, setHasFiles] = useState(true);

  const files = [
    { id: 1, name: 'Q3_Roadmap.pptx', type: 'presentation', size: '4.2 MB', date: 'Today, 10:30 AM', icon: <FileText className="w-5 h-5 text-orange-500" /> },
    { id: 2, name: 'server_logs_prod.txt', type: 'code', size: '12.8 MB', date: 'Yesterday', icon: <FileCode className="w-5 h-5 text-emerald-500" /> },
    { id: 3, name: 'Design_System_v2.fig', type: 'design', size: '84.1 MB', date: 'Oct 12', icon: <FileImage className="w-5 h-5 text-purple-500" /> },
    { id: 4, name: 'Q2_Financials.pdf', type: 'document', size: '1.1 MB', date: 'Oct 10', icon: <FileText className="w-5 h-5 text-red-500" /> },
  ];

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <PageHeader 
          title="File Workspace" 
          description="Manage and analyze your indexed documents." 
        />
        
        {hasFiles && (
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]",
              isSudo && "rounded-sm border-emerald-500/30 bg-emerald-500/5"
            )}>
              <Search className="w-4 h-4 text-[var(--muted)]" />
              <input 
                type="text" 
                placeholder="Search files..." 
                className={cn(
                  "bg-transparent border-none outline-none text-sm w-32 sm:w-48 text-[var(--text)] placeholder-[var(--muted)]",
                  isSudo && "font-mono"
                )}
              />
            </div>
            <button className={cn(
              "px-4 py-2 text-sm font-medium rounded-xl flex items-center gap-2 transition-all",
              isSudo 
                ? "bg-emerald-600 text-black hover:bg-emerald-500 rounded-sm font-mono" 
                : "bg-[var(--accent)] text-white hover:opacity-90 shadow-md"
            )}>
              <UploadCloud className="w-4 h-4" />
              Upload
            </button>
          </div>
        )}
      </div>
      
      {!hasFiles ? (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState 
            title="No Files Indexed"
            description="Upload documents or connect folders to let the assistant analyze, summarize, and search your files."
            icon={<FileText className="w-8 h-8" />}
            action={{
              label: "Upload Files",
              onClick: () => setHasFiles(true),
              icon: <UploadCloud className="w-4 h-4" />
            }}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col animate-in fade-in duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className={cn(
              "p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/50 shadow-sm flex items-center gap-3 cursor-pointer hover:border-[var(--accent)] transition-colors",
              isSudo && "rounded-sm border-emerald-500/20 hover:border-emerald-500/50"
            )}>
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--accent)]/10 text-[var(--accent)]", isSudo && "rounded-sm bg-emerald-500/10 text-emerald-400")}>
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className={cn("text-sm font-medium text-[var(--text)]", isSudo && "font-mono text-emerald-50")}>Summarize All</h4>
                <p className="text-xs text-[var(--muted)]">Generate a report</p>
              </div>
            </div>
          </div>

          <div className={cn(
            "flex-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/30 overflow-hidden flex flex-col",
            isSudo && "rounded-sm border-emerald-500/20"
          )}>
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-[var(--border)] text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
              <div className="col-span-6">Name</div>
              <div className="col-span-2">Size</div>
              <div className="col-span-3">Date Modified</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            
            <div className="overflow-y-auto">
              {files.map(file => (
                <div key={file.id} className={cn(
                  "grid grid-cols-12 gap-4 p-4 items-center border-b border-[var(--border)]/50 hover:bg-[var(--surface)] transition-colors cursor-pointer",
                  isSudo && "hover:bg-emerald-500/5 border-emerald-500/10"
                )}>
                  <div className="col-span-6 flex items-center gap-3">
                    {file.icon}
                    <span className={cn("font-medium text-[var(--text)] text-sm", isSudo && "font-mono text-emerald-50")}>{file.name}</span>
                  </div>
                  <div className={cn("col-span-2 text-sm text-[var(--muted)]", isSudo && "font-mono")}>{file.size}</div>
                  <div className={cn("col-span-3 text-sm text-[var(--muted)]", isSudo && "font-mono")}>{file.date}</div>
                  <div className="col-span-1 flex justify-end">
                    <button className="p-1.5 text-[var(--muted)] hover:text-[var(--text)] rounded-lg hover:bg-[var(--bg)] transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
