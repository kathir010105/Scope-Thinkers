import { useEffect, useRef, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  Settings,
  ShoppingBag,
  User,
  LogOut,
  ClipboardList,
} from "lucide-react";

import CardNav from "../ui/CardNav";

import { navigationItems } from "./navigationData";

import { useAuth } from "../../context/AuthContext";

import logoTrans from "../../assets/logo-trans.png";

function BlueberryNav() {
  const navigate = useNavigate();

  const { user, isAuthenticated, signOut } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);

  // ============================================
  // USER NAME
  // ============================================

  const userName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Profile";

  // ============================================
  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  // ============================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ============================================
  // PROFILE BUTTON
  // ============================================

  const handleProfileClick = () => {
    setProfileOpen((previous) => !previous);
  };

  // ============================================
  // LOGIN
  // ============================================

  const handleLogin = () => {
    setProfileOpen(false);

    navigate("/login");
  };

  // ============================================
  // LOGOUT
  // ============================================

  const handleLogout = async () => {
    try {
      await signOut();

      setProfileOpen(false);

      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="relative z-[100]">
      {/* ====================================== */}
      {/* CARD NAV */}
      {/* ====================================== */}

      <CardNav
        logo={logoTrans}
        logoAlt="Blueberry"
        items={navigationItems}
        baseColor="#ffffff"
        menuColor="#2563EB"
        buttonBgColor="#2563EB"
        buttonTextColor="#ffffff"
        buttonText={isAuthenticated ? "Profile" : "Login"}
        onButtonClick={isAuthenticated ? handleProfileClick : handleLogin}
      />

      {/* ====================================== */}
      {/* PROFILE DROPDOWN */}
      {/* ====================================== */}

      {isAuthenticated && profileOpen && (
        <div
          ref={profileRef}
          className="
              absolute
              right-[5%]
              top-[5.5rem]
              z-[200]
              w-72
              overflow-hidden
              rounded-2xl
              border
              border-gray-100
              bg-white
              shadow-2xl
              shadow-blue-900/10
            "
        >
          {/* ================================= */}
          {/* PROFILE HEADER */}
          {/* ================================= */}

          <div
            className="
                border-b
                border-gray-100
                bg-blue-50
                px-4
                py-4
              "
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}

              <div
                className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-blue-600
                    text-white
                  "
              >
                <User className="h-5 w-5" />
              </div>

              {/* User information */}

              <div className="min-w-0">
                <p
                  className="
                      truncate
                      text-sm
                      font-bold
                      text-gray-900
                    "
                >
                  {userName}
                </p>

                <p
                  className="
                      truncate
                      text-xs
                      text-gray-500
                    "
                >
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* ================================= */}
          {/* PROFILE MENU */}
          {/* ================================= */}

          <div className="p-2">
            {/* Profile */}

            <Link
              to="/profile"
              onClick={() => setProfileOpen(false)}
              className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-3
                  text-sm
                  font-medium
                  text-gray-700
                  transition
                  hover:bg-blue-50
                  hover:text-blue-600
                "
            >
              <User className="h-4 w-4" />
              Profile
            </Link>

            {/* Orders */}

            <Link
              to="/orders"
              onClick={() => setProfileOpen(false)}
              className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-3
                  text-sm
                  font-medium
                  text-gray-700
                  transition
                  hover:bg-blue-50
                  hover:text-blue-600
                "
            >
              <ClipboardList className="h-4 w-4" />
              My Orders
            </Link>

            {/* Cart */}

            <Link
              to="/cart"
              onClick={() => setProfileOpen(false)}
              className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-3
                  text-sm
                  font-medium
                  text-gray-700
                  transition
                  hover:bg-blue-50
                  hover:text-blue-600
                "
            >
              <ShoppingBag className="h-4 w-4" />
              My Cart
            </Link>

            {/* Settings */}

            <Link
              to="/settings"
              onClick={() => setProfileOpen(false)}
              className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-3
                  text-sm
                  font-medium
                  text-gray-700
                  transition
                  hover:bg-blue-50
                  hover:text-blue-600
                "
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </div>

          {/* ================================= */}
          {/* LOGOUT */}
          {/* ================================= */}

          <div
            className="
                border-t
                border-gray-100
                p-2
              "
          >
            <button
              type="button"
              onClick={handleLogout}
              className="
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-3
                  text-sm
                  font-semibold
                  text-red-500
                  transition
                  hover:bg-red-50
                "
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BlueberryNav;
