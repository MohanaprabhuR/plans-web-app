"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import HeaderLayout from "@/components/BaseComponents/common/header";
import { ScreenLoading } from "@/components/ui/screen-loading";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const isOnboarding = pathname?.startsWith("/onboarding");
  const isBuyInsurance = pathname?.startsWith("/buy-insurance");

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
    return <ScreenLoading variant="full" label="Checking session" />;
  }

  return (
    <>
      {(isOnboarding || isBuyInsurance) && <div>{children}</div>}
      {!isOnboarding && !isBuyInsurance && (
        <>
          <HeaderLayout />
          <div className="relative flex min-h-[calc(100vh-62px)] w-full flex-col items-center pb-12">
            <div className="pointer-events-none absolute left-0 top-15 mt-0 h-77 w-full bg-[linear-gradient(180deg,#FFF7ED_0%,rgba(255,247,237,0)_75%)]" />
            <div className="relative z-10 mx-auto w-full max-w-285.5 px-4 pt-[100px]">
              {children}
            </div>
          </div>
        </>
      )}
    </>
  );
}
