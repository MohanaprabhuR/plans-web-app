"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import HeaderLayout from "@/components/BaseComponents/common/header";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const isOnboarding = pathname?.startsWith("/onboarding");

  useEffect(() => {
    const run = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        router.replace("/");
        return;
      }
      const complete = session.user.user_metadata?.onboarding_complete === true;
      const isDashboard = pathname?.startsWith("/dashboard");
      if (isDashboard && !complete) {
        router.replace("/onboarding");
        return;
      }
      setChecking(false);
    };
    run();
  }, [router, pathname]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      {isOnboarding && <div>{children}</div>}
      <HeaderLayout />
      <div className="flex items-center justify-center h-full bg-[linear-gradient(180deg,#FFF7ED_0%,rgba(255,247,237,0)_75%)] relative pb-12">
        <div className="h-77 bg-[linear-gradient(180deg,#FFF7ED_0%,rgba(255,247,237,0)_75%)] absolute top-0 left-0 w-full"></div>
        <div className="relative z-10 w-full max-w-285.5 mx-auto pt-8 px-4">
          {children}
        </div>
      </div>
    </>
  );
}
