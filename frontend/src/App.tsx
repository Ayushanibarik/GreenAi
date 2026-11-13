import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import WorkloadPage from './pages/WorkloadPage';
import BenchmarkPage from './pages/BenchmarkPage';
import OptimizerPage from './pages/OptimizerPage';
import CarbonPage from './pages/CarbonPage';
import HardwarePage from './pages/HardwarePage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
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
  );
}
