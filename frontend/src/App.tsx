import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const WorkloadPage = lazy(() => import('./pages/WorkloadPage'));
const BenchmarkPage = lazy(() => import('./pages/BenchmarkPage'));
const OptimizerPage = lazy(() => import('./pages/OptimizerPage'));
const CarbonPage = lazy(() => import('./pages/CarbonPage'));
const HardwarePage = lazy(() => import('./pages/HardwarePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function PageLoader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="flex items-center gap-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 shadow-xs">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent-primary)] border-t-transparent" />
        <span className="text-xs font-mono text-[var(--text-muted)] tracking-wider uppercase">Loading Workbench View...</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="workloads" element={<WorkloadPage />} />
          <Route path="benchmark" element={<BenchmarkPage />} />
          <Route path="optimizer" element={<OptimizerPage />} />
          <Route path="carbon" element={<CarbonPage />} />
          <Route path="hardware" element={<HardwarePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
