import { create } from 'zustand';

export type Persona = 'titan' | 'astra' | 'sudo';

interface AppState {
  persona: Persona;
  setPersona: (persona: Persona) => void;
  isMicActive: boolean;
  toggleMic: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  persona: 'titan',
  setPersona: (persona) => set({ persona }),
  isMicActive: false,
  toggleMic: () => set((state) => ({ isMicActive: !state.isMicActive })),
}));
