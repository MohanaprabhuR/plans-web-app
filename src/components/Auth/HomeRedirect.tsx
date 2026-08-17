"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthScreen from "./Auth";
import useAuth from "@/hooks/useAuth";

export default function HomeRedirect() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setShowAuth(true);
      return;
    }

    const complete = user.user_metadata?.onboarding_complete === true;
    router.replace(complete ? "/dashboard" : "/onboarding");
  }, [authLoading, user, router]);

  if (authLoading || (!showAuth && user)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <AuthScreen />;
}
