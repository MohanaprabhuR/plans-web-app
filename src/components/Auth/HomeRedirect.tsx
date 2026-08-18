"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthScreen from "./Auth";
import useAuth from "@/hooks/useAuth";

export default function HomeRedirect() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Signed-out (and done loading) → show the auth screen; otherwise the effect
  // below redirects. Derived during render to avoid setState-in-effect.
  const showAuth = !authLoading && !user;

  useEffect(() => {
    if (authLoading || !user) return;
    const complete = user.user_metadata?.onboarding_complete === true;
    router.replace(complete ? "/dashboard" : "/onboarding");
  }, [authLoading, user, router]);

  if (!showAuth) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <AuthScreen />;
}
