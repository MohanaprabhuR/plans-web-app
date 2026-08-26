"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import HeaderLayout from "@/components/BaseComponents/common/header";
import { RouteLoading } from "@/components/ui/route-loading";
import useAuth from "@/hooks/useAuth";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const isOnboarding = pathname?.startsWith("/onboarding");
  const isBuyInsurance = pathname?.startsWith("/buy-insurance");

  // Derive the auth gate during render (no setState-in-effect); the effect only
  // performs the redirect side effect.
  const complete = user?.user_metadata?.onboarding_complete === true;
  const isDashboard = pathname?.startsWith("/dashboard");
  const redirectTo = authLoading
    ? null
    : !user
      ? "/"
      : isDashboard && !complete
        ? "/onboarding"
        : null;
  const authorized = !authLoading && redirectTo === null;

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  if (authLoading || !authorized) {
    return <RouteLoading preset="session" />;
  }

  return (
    <>
      <HeaderLayout />
      {/* Onboarding and buy-insurance own their full-height layouts, so they
          get the header but not the standard page container. */}
      {/* The header is fixed, so these self-laid-out pages need to start
          below it; 15.5 on the spacing scale is the header's 62px. */}
      {(isOnboarding || isBuyInsurance) && (
        <div className="pt-15.5">{children}</div>
      )}
      {!isOnboarding && !isBuyInsurance && (
        <>
          <div className="relative flex min-h-app-screen w-full flex-col items-center pb-12">
            <div className="pointer-events-none absolute left-0 top-15 mt-0 h-77 w-full bg-linear-to-b from-orange-50 to-transparent dark:from-card" />
            <div className="relative z-10 mx-auto w-full max-w-285.5 px-4 pt-25">
              {children}
            </div>
          </div>
        </>
      )}
    </>
  );
}
