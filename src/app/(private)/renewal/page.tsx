"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { CircleAlert } from "lucide-react";
import { toast } from "sonner";

type Renewal = {
  renewalId: string;
  policyId: string;
  type: string;
  provider: string;
  providerLogo: string;
  currentPremium: number;
  newPremium: number;
  dueDate: string;
  status: "pending" | "renewed" | "expired";
};

export default function RenewalPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const showError = (message: string) => {
    toast.custom(() => (
      <Alert variant="error">
        <CircleAlert className="size-4" />
        <AlertTitle>{message}</AlertTitle>
      </Alert>
    ));
  };

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/renewal", {
          headers: { "X-User-Id": user.id },
        });
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as { renewals: Renewal[] };
        if (!cancelled) setRenewals(data.renewals ?? []);
      } catch (e) {
        showError(e instanceof Error ? e.message : "Failed to load renewals.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const handleRenew = async (item: Renewal) => {
    if (!user?.id) return;
    setSubmittingId(item.renewalId);
    try {
      const res = await fetch("/api/renewal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": user.id,
        },
        body: JSON.stringify({ ...item, status: "renewed" }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { renewals: Renewal[] };
      setRenewals(data.renewals ?? []);
      toast.success("Policy renewed successfully.");
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to renew policy.");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full min-h-screen py-10 px-6 md:px-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Renewals</h1>
        <Button variant="outline" onClick={() => router.push("/your-policy")}>
          Back to Your Policies
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Policies up for renewal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && renewals.length === 0 ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : renewals.length === 0 ? (
            <p className="text-muted-foreground">No renewals at the moment.</p>
          ) : (
            renewals.map((r) => (
              <div
                key={r.renewalId}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">
                    {r.provider} — {r.type}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Policy: {r.policyId}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Due date: {r.dueDate}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Current premium: ₹{r.currentPremium} / New: ₹{r.newPremium}
                  </p>
                </div>
                <Button
                  size="sm"
                  disabled={
                    submittingId === r.renewalId || r.status === "renewed"
                  }
                  onClick={() => handleRenew(r)}
                >
                  {r.status === "renewed"
                    ? "Renewed"
                    : submittingId === r.renewalId
                      ? "Renewing…"
                      : "Renew now"}
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
