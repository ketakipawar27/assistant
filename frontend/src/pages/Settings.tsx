import { PageHeader } from '@/components/common/PageHeader';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { Mic, Volume2, Shield, Keyboard, MonitorPlay, Database, Cpu, Lock, TerminalSquare } from 'lucide-react';
import { useState } from 'react';

export function Settings() {
  const { persona, setPersona } = useAppStore();
  const isSudo = persona === 'sudo';
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: <MonitorPlay className="w-4 h-4" /> },
    { id: 'audio', label: 'Audio & Voice', icon: <Mic className="w-4 h-4" /> },
    { id: 'shortcuts', label: 'Shortcuts', icon: <Keyboard className="w-4 h-4" /> },
    { id: 'models', label: 'AI Models', icon: <Cpu className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto w-full">
      <PageHeader 
        title="Settings" 
        description="Configure your assistant preferences and system behaviors." 
      />
      
      <div className="flex flex-col md:flex-row gap-8 mt-6">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                activeTab === tab.id 
                  ? isSudo ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-sm font-mono" : "bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]",
                isSudo && activeTab !== tab.id && "rounded-sm hover:border-emerald-500/10 border border-transparent font-mono"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1 space-y-8 pb-12">
          
          {activeTab === 'general' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section>
                <h2 className={cn("text-lg font-semibold mb-4 text-[var(--text)]", isSudo && "font-mono text-emerald-400")}>Assistant Persona</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    onClick={() => setPersona('titan')}
                    className={cn(
                      "flex flex-col items-start p-5 rounded-2xl border text-left transition-all duration-300",
                      persona === 'titan' 
                        ? "border-blue-500 bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.15)]" 
                        : "border-[var(--border)] bg-[var(--surface)] hover:border-blue-500/50"
                    )}
                  >
                    <span className="font-semibold text-lg mb-2 text-[var(--text)]">Titan Mode</span>
                    <span className="text-sm text-[var(--muted)] leading-relaxed">Tactical, masculine, cinematic command-center.</span>
                  </button>
                  
                  <button
                    onClick={() => setPersona('astra')}
                    className={cn(
                      "flex flex-col items-start p-5 rounded-2xl border text-left transition-all duration-300",
                      persona === 'astra' 
                        ? "border-purple-500 bg-purple-500/5 shadow-[0_0_20px_rgba(192,132,252,0.15)]" 
                        : "border-[var(--border)] bg-[var(--surface)] hover:border-purple-500/50"
                    )}
                  >
                    <span className="font-semibold text-lg mb-2 text-[var(--text)]">Astra Mode</span>
                    <span className="text-sm text-[var(--muted)] leading-relaxed">Elegant, feminine, futuristic soft-glow assistant.</span>
                  </button>

                  <button
                    onClick={() => setPersona('sudo')}
                    className={cn(
                      "flex flex-col items-start p-5 rounded-2xl border text-left transition-all duration-300",
                      persona === 'sudo' 
                        ? "border-emerald-500 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.15)] rounded-sm" 
                        : "border-[var(--border)] bg-[var(--surface)] hover:border-emerald-500/50 rounded-sm"
                    )}
                  >
                    <span className="font-mono font-semibold text-lg mb-2 text-emerald-400 flex items-center gap-2">
                      <TerminalSquare className="w-4 h-4" /> SUDO Mode
                    </span>
                    <span className="text-sm text-[var(--muted)] leading-relaxed">Advanced operator, privileged system control.</span>
                  </button>
                </div>
              </section>

              <section>
                <h2 className={cn("text-lg font-semibold mb-4 text-[var(--text)]", isSudo && "font-mono text-emerald-400")}>System Behavior</h2>
                <div className={cn(
                  "p-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/50 shadow-sm space-y-1",
                  isSudo && "rounded-sm border-emerald-500/20"
                )}>
                  <SettingToggle 
                    title="Start with Windows" 
                    description="Launch assistant automatically on boot in the system tray." 
                    defaultChecked={true} 
                  />
                  <SettingToggle 
                    title="Keep overlay on top" 
                    description="Floating chat and voice overlay always stay above other windows." 
                    defaultChecked={true} 
                  />
                  <SettingToggle 
                    title="Hardware Acceleration" 
                    description="Use GPU for rendering UI animations and local models." 
                    defaultChecked={true} 
                  />
                </div>
              </section>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section>
                <h2 className={cn("text-lg font-semibold mb-4 text-[var(--text)]", isSudo && "font-mono text-emerald-400")}>Voice Input</h2>
                <div className={cn(
                  "p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/50 shadow-sm space-y-6",
                  isSudo && "rounded-sm border-emerald-500/20"
                )}>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-2">Microphone Device</label>
                    <select className={cn(
                      "w-full p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]",
                      isSudo && "rounded-sm font-mono border-emerald-500/30 focus:border-emerald-500"
                    )}>
                      <option>Default System Microphone</option>
                      <option>External USB Mic (Focusrite)</option>
                      <option>MacBook Pro Microphone</option>
                    </select>
                  </div>
                  <SettingToggle 
                    title="Voice Wake Word" 
                    description="Listen for 'Hey Titan' or 'Hey Astra' in the background." 
                    defaultChecked={false} 
                  />
                  <SettingToggle 
                    title="Continuous Listening" 
                    description="Keep microphone open after assistant responds for follow-up questions." 
                    defaultChecked={true} 
                  />
                </div>
              </section>
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section>
                <h2 className={cn("text-lg font-semibold mb-4 text-[var(--text)]", isSudo && "font-mono text-emerald-400")}>Global Hotkeys</h2>
                <div className={cn(
                  "p-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/50 shadow-sm space-y-1",
                  isSudo && "rounded-sm border-emerald-500/20"
                )}>
                  <ShortcutRow label="Toggle Floating Chat" shortcut="Option + Space" />
                  <ShortcutRow label="Start Voice Command" shortcut="Option + V" />
                  <ShortcutRow label="Capture Screenshot & Ask" shortcut="Option + S" />
                  <ShortcutRow label="Open Main Dashboard" shortcut="Option + D" />
                </div>
              </section>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section>
                <h2 className={cn("text-lg font-semibold mb-4 text-[var(--text)]", isSudo && "font-mono text-emerald-400")}>Data & Privacy</h2>
                <div className={cn(
                  "p-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/50 shadow-sm space-y-1",
                  isSudo && "rounded-sm border-emerald-500/20"
                )}>
                  <SettingToggle 
                    title="Local History Storage" 
                    description="Keep conversation history only on this device." 
                    defaultChecked={true} 
                  />
                  <SettingToggle 
                    title="Screen Context Access" 
                    description="Allow assistant to read active window contents when asked." 
                    defaultChecked={true} 
                  />
                  <SettingToggle 
                    title="Telemetry & Diagnostics" 
                    description="Send anonymous usage data to improve the assistant." 
                    defaultChecked={false} 
                  />
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button className="px-4 py-2 text-sm font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors">
                    Clear All Assistant Data
                  </button>
                </div>
              </section>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function SettingToggle({ title, description, defaultChecked }: { title: string, description: string, defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked || false);
  const persona = useAppStore(s => s.persona);
  const isSudo = persona === 'sudo';

  return (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-xl hover:bg-[var(--bg)]/50 transition-colors",
      isSudo && "rounded-sm hover:bg-emerald-500/5"
    )}>
      <div className="pr-8">
        <h3 className={cn("font-medium text-[var(--text)]", isSudo && "font-mono text-emerald-50")}>{title}</h3>
        <p className={cn("text-sm text-[var(--muted)] mt-0.5", isSudo && "font-mono text-emerald-500/60")}>{description}</p>
      </div>
      <button 
        onClick={() => setChecked(!checked)}
        className={cn(
          "w-11 h-6 rounded-full relative transition-colors duration-300 shrink-0",
          checked 
            ? isSudo ? "bg-emerald-500" : "bg-[var(--accent)]" 
            : "bg-[var(--border)]",
          isSudo && "rounded-sm"
        )}
      >
        <div className={cn(
          "absolute top-1 w-4 h-4 bg-white transition-transform duration-300 shadow-sm",
          checked ? "translate-x-6" : "translate-x-1",
          isSudo ? "rounded-sm" : "rounded-full"
        )} />
      </button>
    </div>
  );
}

function ShortcutRow({ label, shortcut }: { label: string, shortcut: string }) {
  const persona = useAppStore(s => s.persona);
  const isSudo = persona === 'sudo';
  
  return (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-xl hover:bg-[var(--bg)]/50 transition-colors",
      isSudo && "rounded-sm hover:bg-emerald-500/5"
    )}>
      <span className={cn("font-medium text-[var(--text)]", isSudo && "font-mono text-emerald-50")}>{label}</span>
      <div className="flex gap-1">
        {shortcut.split(' + ').map((key, i) => (
          <span key={i} className={cn(
            "px-2.5 py-1 text-xs font-medium bg-[var(--bg)] border border-[var(--border)] rounded-md text-[var(--muted)]",
            isSudo && "font-mono rounded-sm border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
          )}>
            {key}
          </span>
        ))}
      </div>
    </div>
  );
}
