import { HashRouter, Routes, Route } from "react-router-dom";
import AppBootstrap from "@/components/AppBootstrap";
import DashboardPage from "@/pages/DashboardPage";
import ManagePage from "@/pages/ManagePage";

export default function App() {
  return (
    <AppBootstrap>
      <HashRouter>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/manage" element={<ManagePage />} />
        </Routes>
      </HashRouter>
    </AppBootstrap>
  );
}
