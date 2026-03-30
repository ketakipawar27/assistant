/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Chat } from './pages/Chat';
import { VoiceMode } from './pages/VoiceMode';
import { Automations } from './pages/Automations';
import { Skills } from './pages/Skills';
import { Files } from './pages/Files';
import { Memory } from './pages/Memory';
import { History } from './pages/History';
import { Integrations } from './pages/Integrations';
import { Settings } from './pages/Settings';
import { RuntimePreview } from './pages/RuntimePreview';
import { GlobalRuntime } from './components/runtime/GlobalRuntime';

export default function App() {
  return (
    <BrowserRouter>
      <GlobalRuntime />
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="chat" element={<Chat />} />
          <Route path="voice" element={<VoiceMode />} />
          <Route path="automations" element={<Automations />} />
          <Route path="skills" element={<Skills />} />
          <Route path="files" element={<Files />} />
          <Route path="memory" element={<Memory />} />
          <Route path="history" element={<History />} />
          <Route path="integrations" element={<Integrations />} />
          <Route path="settings" element={<Settings />} />
          <Route path="preview" element={<RuntimePreview />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
