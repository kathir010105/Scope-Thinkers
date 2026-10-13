import { useState } from "react";
import UserSidebar from "./UserSidebar";
import UserHeader from "./UserHeader";

function UserLayout({ children }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-[#f8f2ee]">
      <UserSidebar
        expanded={sidebarExpanded}
        setExpanded={setSidebarExpanded}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <UserHeader />
        <main className="min-w-0 flex-1 overflow-y-auto p-5 lg:p-8">
          <div className="mx-auto w-full max-w-[1500px]">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default UserLayout;
