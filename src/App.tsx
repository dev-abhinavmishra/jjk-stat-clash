import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Analytics } from '@vercel/analytics/react';

const Home = lazy(() => import('./pages/Home'));
const LocalDraft = lazy(() => import('./pages/LocalDraft'));
const BotDraft = lazy(() => import('./pages/BotDraft'));
const MultiplayerLobby = lazy(() => import('./pages/MultiplayerLobby'));
const MultiplayerDraft = lazy(() => import('./pages/MultiplayerDraft'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));

import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ToastProvider } from './components/Toast';

function PageSuspense({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingSpinner fullScreen />}>{children}</Suspense>;
}

export default function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <ToastProvider>
          <Router>
            {/* Fallback title — pages render their own via <Helmet>; this keeps the
              tab from showing the bare URL on routes/branches without one. */}
            <Helmet>
              <title>JJK Stat Clash</title>
            </Helmet>
            <Routes>
              <Route
                path="/"
                element={
                  <PageSuspense>
                    <Home />
                  </PageSuspense>
                }
              />
              <Route
                path="/play"
                element={
                  <PageSuspense>
                    <LocalDraft />
                  </PageSuspense>
                }
              />
              <Route
                path="/play/local"
                element={
                  <PageSuspense>
                    <LocalDraft />
                  </PageSuspense>
                }
              />
              <Route
                path="/play/bot"
                element={
                  <PageSuspense>
                    <BotDraft />
                  </PageSuspense>
                }
              />
              <Route
                path="/play/multiplayer"
                element={
                  <PageSuspense>
                    <MultiplayerLobby />
                  </PageSuspense>
                }
              />
              <Route
                path="/play/multiplayer/draft/:roomId"
                element={
                  <PageSuspense>
                    <MultiplayerDraft />
                  </PageSuspense>
                }
              />
              <Route
                path="/leaderboard"
                element={
                  <PageSuspense>
                    <Leaderboard />
                  </PageSuspense>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Analytics />
          </Router>
        </ToastProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}
