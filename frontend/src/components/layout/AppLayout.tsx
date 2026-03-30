import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { RightPanel } from './RightPanel';
import { useAppStore } from '@/store/useAppStore';
import { useEffect } from 'react';

export function AppLayout() {
  const persona = useAppStore((state) => state.persona);

  // Apply theme class to body
  useEffect(() => {
    document.body.classList.remove('theme-astra', 'theme-sudo');
    if (persona === 'astra') {
      document.body.classList.add('theme-astra');
    } else if (persona === 'sudo') {
      document.body.classList.add('theme-sudo');
    }
  }, [persona]);

  const getGlowStyle = () => {
    if (persona === 'titan') return 'radial-gradient(circle, rgba(59,130,246,0.8) 0%, rgba(0,0,0,0) 70%)';
    if (persona === 'astra') return 'radial-gradient(circle, rgba(192,132,252,0.8) 0%, rgba(0,0,0,0) 70%)';
    if (persona === 'sudo') return 'radial-gradient(circle, rgba(16,185,129,0.4) 0%, rgba(0,0,0,0) 70%)';
    return 'none';
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg)] text-[var(--text)] transition-colors duration-500">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto p-8 relative">
          {/* Subtle background glow based on persona */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div 
              className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-20 transition-all duration-1000"
              style={{ background: getGlowStyle() }}
            />
          </div>
          
          <div className="relative z-10 h-full">
            <Outlet />
          </div>
        </main>
      </div>

      <RightPanel />
    </div>
  );
}
