"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import AuthScreen from "./Auth";

export default function HomeRedirect() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const run = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setChecking(false);
        return;
      }
      const complete = session.user.user_metadata?.onboarding_complete === true;
      if (complete) {
        router.replace("/dashbaord");
        return;
      }
      router.replace("/onboarding");
    };
    run();
  }, [router]);

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <AuthScreen />;
}
