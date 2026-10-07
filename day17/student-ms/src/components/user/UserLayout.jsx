import { useState } from "react";

import UserSidebar from "./UserSidebar";
import UserHeader from "./UserHeader";

function UserLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <UserSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-64 min-h-screen">
        <UserHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

export default UserLayout;
