import { useEffect } from "react";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { useDispatch } from "react-redux";

import { onAuthStateChanged } from "firebase/auth";

import { auth } from "./firebase/config";

import { setUser, setAuthLoading } from "./redux/slices/authSlice";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

import ChatApp from "./pages/ChatApp";

function App() {
  const dispatch = useDispatch();

  /* =====================================================
     FIREBASE AUTH LISTENER
  ===================================================== */

  useEffect(() => {
    dispatch(setAuthLoading(true));

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        /*
         * IMPORTANT:
         * Do NOT store firebaseUser directly
         * inside Redux.
         */

        const serializableUser = {
          uid: firebaseUser.uid,

          email: firebaseUser.email || "",

          displayName: firebaseUser.displayName || "",

          photoURL: firebaseUser.photoURL || "",
        };

        dispatch(setUser(serializableUser));
      } else {
        dispatch(setUser(null));
      }

      dispatch(setAuthLoading(false));
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* ==========================================
            ROOT
        ========================================== */}

        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ==========================================
            AUTH
        ========================================== */}

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ==========================================
            CHAT APPLICATION
        ========================================== */}

        <Route path="/app" element={<ChatApp />} />

        {/* ==========================================
            UNKNOWN ROUTES
        ========================================== */}

        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
