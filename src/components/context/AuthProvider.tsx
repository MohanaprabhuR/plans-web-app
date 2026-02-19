"use client";

import type { User } from "@supabase/supabase-js";
import React, { createContext, useEffect, useState } from "react";
import client from "@/api/client";

export type AuthContextValue = {
  user: User | null;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    client.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const nextUser = data.session?.user ?? null;
      setUser(nextUser);
      setLoading(false);
    });

    const { data: listener } = client.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        const nextUser = session?.user ?? null;
        setUser(nextUser);
        // if auth state changes, we are no longer in the "initial boot" state
        setLoading(false);
      },
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

