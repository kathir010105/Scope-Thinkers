import {
  LayoutDashboard,
  TrendingUp,
  Briefcase,
  ArrowLeftRight,
  Star,
  Receipt,
  Wallet,
  BarChart3,
  Menu,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useUIStore } from "../../store/useUIStore";

function Sidebar() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);

  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  const navigation = [
    {
      name: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Markets",
      path: "/markets",
      icon: TrendingUp,
    },
    {
      name: "Portfolio",
      path: "/portfolio",
      icon: Briefcase,
    },
    {
      name: "Trade",
      path: "/trade",
      icon: ArrowLeftRight,
    },
    {
      name: "Watchlist",
      path: "/watchlist",
      icon: Star,
    },
    {
      name: "Transactions",
      path: "/transactions",
      icon: Receipt,
    },
    {
      name: "Expenses",
      path: "/expenses",
      icon: Wallet,
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: BarChart3,
    },
  ];

  return (
    <aside
      className={`h-full border-r border-slate-200 bg-white transition-all duration-300 ${
        sidebarOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-slate-900">FinTerminal</h1>
          )}

          <button
            onClick={toggleSidebar}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-3 transition ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                <Icon size={20} />

                {sidebarOpen && (
                  <span className="text-sm font-medium">{item.name}</span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;
