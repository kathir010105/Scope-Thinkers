import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#080c0a] text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main application area */}
      <div className="min-h-screen pl-64">
        {/* Topbar */}
        <Topbar />

        {/* Page content */}
        <main className="min-h-[calc(100vh-64px)] px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
