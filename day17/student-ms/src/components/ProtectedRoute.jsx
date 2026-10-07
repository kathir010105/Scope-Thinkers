import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoute({ allowedRoles }) {
  const { user, profile, loading, isAuthenticated } = useSelector(
    (state) => state.auth,
  );

  // Wait for Firebase authentication
  // to finish checking the current session.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-sm text-slate-500">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  // No profile
  if (!profile) {
    return <Navigate to="/" replace />;
  }

  // Account isn't approved
  if (profile.status !== "approved") {
    return <Navigate to="/" replace />;
  }

  // Role isn't allowed
  if (!allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  // Everything is valid
  return <Outlet />;
}

export default ProtectedRoute;
