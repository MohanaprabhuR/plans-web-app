"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScreenLoading } from "@/components/ui/screen-loading";
import {
  BriefcaseMedical,
  CalendarDays,
  CarFront,
  CheckCircle2,
  ChevronLeft,
  CircleAlert,
  Clock,
  Heart,
  House,
  PlaneTakeoff,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
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

function getTypeIcon(type: string) {
  switch (type) {
    case "Health":
      return <BriefcaseMedical className="size-5 stroke-[#8E51FF]" />;
    case "Auto":
      return <CarFront className="size-5 stroke-[#E12AFB]" />;
    case "Life":
      return <Heart className="size-5 stroke-[#FF5255]" />;
    case "Travel":
      return <PlaneTakeoff className="size-5 stroke-[#00D3F2]" />;
    case "Home":
      return <House className="size-5 stroke-[#FE9A00]" />;
    default:
      return <ShieldCheck className="size-5 text-muted-foreground" />;
  }
}

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function daysUntil(dueDate: string) {
  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function statusBadge(status: Renewal["status"], days: number | null) {
  if (status === "renewed") {
    return (
      <Badge theme="green" size="md">
        Renewed
      </Badge>
    );
  }
  if (status === "expired") {
    return (
      <Badge theme="red" size="md">
        Expired
      </Badge>
    );
  }
  if (days !== null && days <= 3) {
    return (
      <Badge theme="amber" size="md">
        Due soon
      </Badge>
    );
  }
  return (
    <Badge theme="blue" size="md">
      Pending
    </Badge>
  );
}

export default function RenewalPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightPolicyId = searchParams.get("policyId");

  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [loading, setLoading] = useState(true);
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

  const sortedRenewals = useMemo(() => {
    const list = [...renewals];
    list.sort((a, b) => {
      const order = { pending: 0, expired: 1, renewed: 2 };
      const diff = order[a.status] - order[b.status];
      if (diff !== 0) return diff;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
    if (highlightPolicyId) {
      const idx = list.findIndex((r) => r.policyId === highlightPolicyId);
      if (idx > 0) {
        const [item] = list.splice(idx, 1);
        list.unshift(item);
      }
    }
    return list;
  }, [renewals, highlightPolicyId]);

  const stats = useMemo(() => {
    const pending = renewals.filter((r) => r.status === "pending");
    const renewed = renewals.filter((r) => r.status === "renewed");
    const premiumDelta = pending.reduce(
      (sum, r) => sum + (r.newPremium - r.currentPremium),
      0,
    );
    return {
      pendingCount: pending.length,
      renewedCount: renewed.length,
      premiumDelta,
    };
  }, [renewals]);

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
    <div className="flex flex-col gap-8 pb-20">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="lg"
          iconOnly
          onClick={() => router.push("/your-policy")}
          aria-label="Back to your policies"
        >
          <ChevronLeft />
        </Button>

        <h3 className="text-2xl font-bold tracking-4 text-foreground">
          Policy renewals
        </h3>
      </div>

      {loading ? (
        <ScreenLoading label="Loading renewals" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className=" bg-card shadow-sm">
              <CardContent className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-full bg-amber-100">
                  <Clock className="size-6 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Pending
                  </p>
                  <p className="text-3xl font-semibold tracking-4 text-foreground">
                    {stats.pendingCount}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card shadow-sm">
              <CardContent className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="size-6 text-green-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Renewed
                  </p>
                  <p className="text-3xl font-semibold tracking-4 text-foreground">
                    {stats.renewedCount}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card shadow-sm">
              <CardContent className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-full bg-blue-100">
                  <TrendingUp className="size-6 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Est. change (pending)
                  </p>
                  <p className="text-3xl font-semibold tracking-4 text-foreground">
                    {stats.premiumDelta >= 0 ? "+" : ""}₹{stats.premiumDelta}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {sortedRenewals.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-accent">
                  <RefreshCw className="size-8 text-muted-foreground" />
                </div>
                <div className="max-w-sm space-y-1">
                  <p className="text-lg font-semibold text-foreground">
                    No renewals right now
                  </p>
                  <p className="text-sm text-muted-foreground">
                    When a policy is due for renewal, it will show up here with
                    updated premium details.
                  </p>
                </div>
                <Button onClick={() => router.push("/your-policy")}>
                  View your policies
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {sortedRenewals.map((r) => {
                const days = daysUntil(r.dueDate);
                const isHighlighted = highlightPolicyId === r.policyId;
                const premiumChange = r.newPremium - r.currentPremium;
                const canRenew =
                  r.status !== "renewed" && r.status !== "expired";

                return (
                  <Card
                    key={r.renewalId}
                    className={`overflow-hidden transition-shadow ${
                      isHighlighted
                        ? "ring-2 ring-primary/40 shadow-md"
                        : "shadow-sm"
                    }`}
                  >
                    <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-dashed pb-4">
                      <div className="flex items-start gap-4">
                        <div className="relative shrink-0">
                          <div className="flex size-14 items-center justify-center overflow-hidden rounded-xl border bg-white p-1">
                            <Image
                              src={
                                r.providerLogo ||
                                "https://img.freepik.com/free-vector/insurance-policy-shield_603843-179.jpg"
                              }
                              alt={r.provider}
                              width={48}
                              height={48}
                              className="object-contain"
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border bg-background shadow-sm">
                            {getTypeIcon(r.type)}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-xl font-semibold leading-6">
                            {r.provider}
                          </CardTitle>
                          <p className="text-sm font-medium text-muted-foreground">
                            {r.type} · {r.policyId}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {statusBadge(r.status, days)}
                            {days !== null && r.status === "pending" && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                <CalendarDays className="size-3.5" />
                                {days <= 0
                                  ? "Due today"
                                  : `${days} day${days === 1 ? "" : "s"} left`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Due date
                        </p>
                        <p className="text-base font-semibold text-foreground">
                          {formatDate(r.dueDate)}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="grid grid-cols-2 gap-4 sm:gap-8">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            Current premium
                          </p>
                          <p className="text-2xl font-semibold tracking-4 text-foreground">
                            ₹{r.currentPremium.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            New premium
                          </p>
                          <p className="text-2xl font-semibold tracking-4 text-foreground">
                            ₹{r.newPremium.toLocaleString()}
                          </p>
                          {premiumChange !== 0 && (
                            <p
                              className={`text-xs font-medium ${
                                premiumChange > 0
                                  ? "text-amber-700"
                                  : "text-green-700"
                              }`}
                            >
                              {premiumChange > 0 ? "+" : ""}₹
                              {premiumChange.toLocaleString()} vs current
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        size="lg"
                        className="w-full shrink-0 sm:w-auto"
                        disabled={!canRenew || submittingId === r.renewalId}
                        onClick={() => handleRenew(r)}
                      >
                        {r.status === "renewed" ? (
                          <>
                            <CheckCircle2 className="size-4" />
                            Renewed
                          </>
                        ) : submittingId === r.renewalId ? (
                          "Renewing…"
                        ) : (
                          "Renew now"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
