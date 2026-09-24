import { createContext, useContext, useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get the current session when the app starts
    async function getInitialSession() {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Failed to get auth session:", error);
      }

      if (!mounted) return;

      setSession(data?.session || null);
      setUser(data?.session?.user || null);
      setLoading(false);
    }

    getInitialSession();

    // Listen for login/logout/session changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession || null);
      setUser(newSession?.user || null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // -----------------------------------
  // SIGN UP
  // -----------------------------------

  const signUp = async ({ email, password, fullName }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,

      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      throw error;
    }

    return data;
  };

  // -----------------------------------
  // LOGIN
  // -----------------------------------

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  };

  // -----------------------------------
  // LOGOUT
  // -----------------------------------

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    isAuthenticated: !!user,

    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
