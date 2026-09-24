import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import AppHeader from './components/AppHeader';
import DebugPanel from './components/DebugPanel';
import { dlog } from './lib/debugLog';
import { runEnvDiagnostics } from './lib/envDebug';

// [2am-debug] Full env diagnostics + SUMMARY line, emitted once at app load.
runEnvDiagnostics('App module load');

dlog('boot', 'App module loaded', {
  hasPublicKey:
    !!import.meta.env.VITE_VAPI_PUBLIC_KEY &&
    import.meta.env.VITE_VAPI_PUBLIC_KEY !== 'your_public_key_here',
  hasAssistantId:
    !!import.meta.env.VITE_VAPI_ASSISTANT_ID &&
    import.meta.env.VITE_VAPI_ASSISTANT_ID !== 'your_assistant_id_here',
  userAgent:
    typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 80) : 'n/a',
  protocol: typeof location !== 'undefined' ? location.protocol : 'n/a',
});

import Welcome from './pages/Welcome';
import Home from './pages/Home';
import VoiceConversation from './pages/VoiceConversation';
import ThinkingState from './pages/ThinkingState';
import ActiveConversation from './pages/ActiveConversation';
import RiskAlert from './pages/RiskAlert';
import FindingCounselor from './pages/FindingCounselor';
import CounselorMatch from './pages/CounselorMatch';
import BookingConfirmed from './pages/BookingConfirmed';
import ConfirmationSent from './pages/ConfirmationSent';
import CrisisHelplines from './pages/CrisisHelplines';
import Share from './pages/Share';
import History from './pages/History';
import HistoryDetail from './pages/HistoryDetail';
import Resources from './pages/Resources';
import Profile from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <div className="bg-navy min-h-screen text-white">
          <Toast />
          <AppHeader />
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/home" element={<Home />} />
            <Route path="/voice" element={<VoiceConversation />} />
            <Route path="/thinking" element={<ThinkingState />} />
            <Route path="/conversation" element={<ActiveConversation />} />
            <Route path="/risk-alert" element={<RiskAlert />} />
            <Route path="/finding-counselor" element={<FindingCounselor />} />
            <Route path="/counselor-match" element={<CounselorMatch />} />
            <Route path="/booking-confirmed" element={<BookingConfirmed />} />
            <Route path="/confirmation-sent" element={<ConfirmationSent />} />
            <Route path="/crisis" element={<CrisisHelplines />} />
            <Route path="/share" element={<Share />} />
            <Route path="/history" element={<History />} />
            <Route path="/history/:id" element={<HistoryDetail />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <BottomNav />
          {import.meta.env.DEV && <DebugPanel />}
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}
