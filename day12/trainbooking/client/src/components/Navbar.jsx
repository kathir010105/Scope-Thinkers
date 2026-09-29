import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { User, Settings, LogOut, BookOpen, ChevronDown } from "lucide-react";

import PillNav from "./PillNav";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, isAuthenticated, logout } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);

  const publicItems = [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Search Trains",
      href: "/search",
    },
  ];

  const authenticatedItems = [
    ...publicItems,
    {
      label: "My Bookings",
      href: "/my-bookings",
    },
  ];

  const items = isAuthenticated
    ? authenticatedItems
    : [
        ...publicItems,
        {
          label: "Login",
          href: "/login",
        },
        {
          label: "Register",
          href: "/register",
        },
      ];

  const getInitial = () => {
    if (user?.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }

    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }

    return "U";
  };

  const handleLogout = async () => {
    try {
      await logout();
      setProfileOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      <PillNav
        logo={logo}
        logoAlt="RailBook"
        items={items}
        activeHref={location.pathname}
        ease="power3.easeOut"
        baseColor="#991b1b"
        pillColor="#ffffff"
        hoveredPillTextColor="#ffffff"
        pillTextColor="#0f172a"
        initialLoadAnimation={true}
      />

      {isAuthenticated && (
        <div className="fixed right-8 top-4 z-[1100]">
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1.5 pr-3 shadow-sm transition hover:shadow-md"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-800 text-sm font-bold text-white">
              {getInitial()}
            </div>

            <ChevronDown
              size={16}
              className={`text-slate-500 transition ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              {/* User info */}

              <div className="border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100 font-bold text-red-800">
                    {getInitial()}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {user?.displayName || "RailBook User"}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu */}

              <div className="p-2">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/profile");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-red-50 hover:text-red-800"
                >
                  <User size={18} />
                  Profile
                </button>

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/my-bookings");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-red-50 hover:text-red-800"
                >
                  <BookOpen size={18} />
                  My Bookings
                </button>

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/settings");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-red-50 hover:text-red-800"
                >
                  <Settings size={18} />
                  Settings
                </button>
              </div>

              {/* Logout */}

              <div className="border-t border-slate-100 p-2">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-700 transition hover:bg-red-50"
                >
                  <LogOut size={18} />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default Navbar;
