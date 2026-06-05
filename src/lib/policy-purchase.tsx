"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

export const POLICY_PURCHASE_TOAST_KEY = "policy-purchase-success";
export const POLICY_PURCHASE_RETURN_KEY = "policy-purchase-return-to";

export function setPolicyPurchaseReturnTo(path: string) {
  if (typeof window === "undefined") return;
  if (path.startsWith("/")) {
    sessionStorage.setItem(POLICY_PURCHASE_RETURN_KEY, path);
  }
}

export function getPolicyPurchaseReturnTo(): string {
  if (typeof window === "undefined") return "/your-policy";
  const path = sessionStorage.getItem(POLICY_PURCHASE_RETURN_KEY);
  sessionStorage.removeItem(POLICY_PURCHASE_RETURN_KEY);
  return path?.startsWith("/") ? path : "/your-policy";
}

export function buildPolicyPurchaseSuccessUrl(
  basePath: string,
  params: { type?: string; provider?: string },
) {
  const [pathname, existingQuery = ""] = basePath.split("?");
  const search = new URLSearchParams(existingQuery);
  search.set("purchased", "success");
  if (params.type) search.set("type", params.type);
  if (params.provider) search.set("provider", params.provider);
  const query = search.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function usePolicyPurchaseSuccessToast(onShown?: () => void) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("purchased") !== "success") return;

    const guardKey = `${POLICY_PURCHASE_TOAST_KEY}:${pathname}`;
    if (sessionStorage.getItem(guardKey) === "1") {
      router.replace(pathname);
      return;
    }
    sessionStorage.setItem(guardKey, "1");

    const purchasedType = params.get("type");
    const provider = params.get("provider");

    toast.custom(
      () => (
        <Alert variant="success">
          <CheckCircle className="size-4" />
          <AlertTitle>
            Policy purchased successfully
            {provider
              ? ` — ${provider}`
              : purchasedType
                ? ` — ${purchasedType}`
                : ""}
            .
          </AlertTitle>
        </Alert>
      ),
      { id: POLICY_PURCHASE_TOAST_KEY },
    );

    onShown?.();
    router.replace(pathname);
    sessionStorage.removeItem(guardKey);
  }, [pathname, router, onShown]);
}
