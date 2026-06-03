"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScreenLoading } from "@/components/ui/screen-loading";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  Bell,
  CarFront,
  ChevronLeft,
  CircleAlert,
  ClipboardList,
  CreditCard,
  Hospital,
  House,
  LifeBuoy,
  PlaneTakeoff,
  ShieldCheck,
} from "lucide-react";

const DEFAULT_LOGO =
  "https://img.freepik.com/free-vector/insurance-policy-shield_603843-179.jpg";

const NOTIFICATIONS_PAGE_SIZE = 5;

type NotificationItem = {
  notificationId: string;
  type: string;
  title: string;
  message: string;
  priority: "high" | "medium" | "low" | string;
  read: boolean;
  timestamp: string;
  provider?: string;
  providerLogo?: string;
  category?: string;
};

interface ApiResponse {
  endpoints: {
    notifications?: {
      getNotifications?: {
        response?: NotificationItem[];
      };
    };
  };
}

function formatTypeLabel(type: string) {
  if (type === "policy_renewal") return "Renewal";
  if (type === "claim_update") return "Claim";
  if (type === "payment") return "Payment";
  return type.replace(/_/g, " ");
}

/** Policy line icon — matches policyList (Health, Auto, Home, …) */
function getCategoryIcon(category: string) {
  switch (category) {
    case "Health":
      return <Hospital className="size-5 min-w-5 text-[#8E51FF]" />;
    case "Auto":
      return <CarFront className="size-5 min-w-5 text-[#E12AFB]" />;
    case "Life":
      return <LifeBuoy className="size-5 min-w-5 text-[#FE9A00]" />;
    case "Travel":
      return <PlaneTakeoff className="size-5 min-w-5 text-[#FE9A00]" />;
    case "Home":
      return <House className="size-5 min-w-5 text-[#FE9A00]" />;
    default:
      return null;
  }
}

/** Notification event icon (renewal, claim, payment) */
function getTypeIcon(type: string) {
  if (type === "policy_renewal")
    return <House className="size-5 min-w-5 text-[#FE9A00]" />;
  if (type === "claim_update")
    return <ClipboardList className="size-5 min-w-5 text-[#8E51FF]" />;
  if (type === "payment")
    return <CreditCard className="size-5 min-w-5 text-green-600" />;
  return <ShieldCheck className="size-5 min-w-5 text-muted-foreground" />;
}

function getSubtitleIcon(item: NotificationItem) {
  if (item.category) {
    const categoryIcon = getCategoryIcon(item.category);
    if (categoryIcon) return categoryIcon;
  }
  return getTypeIcon(item.type);
}

function formatDateShort(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function getActionHref(item: NotificationItem): string | null {
  if (item.type === "policy_renewal") return "/renewal";
  if (item.type === "claim_update") return "/my-claims";
  return null;
}

function getPriorityBadge(priority: string): {
  theme: "red" | "amber" | "green";
  variant: "default" | "outline" | "secondary";
} {
  const level = priority.toLowerCase();
  if (level === "high") return { theme: "red", variant: "default" };
  if (level === "medium") return { theme: "amber", variant: "outline" };
  if (level === "low") return { theme: "green", variant: "secondary" };
  return { theme: "amber", variant: "outline" };
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/policy", {
          cache: "no-store",
          headers: { "X-User-Id": user.id },
        });
        if (!res.ok) throw new Error(await res.text());
        const json = (await res.json()) as ApiResponse;
        if (!cancelled) setApiData(json);
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Failed to load notifications.";
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const notifications = useMemo(() => {
    const list =
      apiData?.endpoints?.notifications?.getNotifications?.response ?? [];
    return [...list].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [apiData]);

  const totalPages = Math.max(
    1,
    Math.ceil(notifications.length / NOTIFICATIONS_PAGE_SIZE),
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [notifications.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const visibleNotifications = useMemo(() => {
    const start = (currentPage - 1) * NOTIFICATIONS_PAGE_SIZE;
    return notifications.slice(start, start + NOTIFICATIONS_PAGE_SIZE);
  }, [notifications, currentPage]);

  const isRead = (item: NotificationItem) =>
    item.read || readIds.has(item.notificationId);

  const markAsRead = (id: string) => {
    setReadIds((prev) => new Set(prev).add(id));
  };

  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="lg"
            iconOnly
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ChevronLeft />
          </Button>
          <div>
            <h3 className="text-2xl font-bold tracking-4 text-foreground">
              Notifications
              {!loading && !error && (
                <span className="text-muted-foreground font-semibold">
                  {" "}
                  ({notifications.length})
                </span>
              )}
            </h3>
          </div>
        </div>
      </div>

      {loading && (
        <ScreenLoading
          variant="list"
          showHeader={false}
          rows={5}
          label="Loading notifications"
        />
      )}

      {error && !loading && (
        <Alert variant="error">
          <CircleAlert className="size-4" />
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      )}

      {!loading && !error && notifications.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-accent">
              <Bell className="size-8 text-muted-foreground" />
            </div>
            <div className="max-w-sm space-y-1">
              <p className="text-lg font-semibold text-foreground">
                You&apos;re all caught up
              </p>
              <p className="text-sm text-muted-foreground">
                New alerts about policies, claims, and payments will appear
                here.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && notifications.length > 0 && (
        <div className="flex flex-col gap-4">
          {visibleNotifications.map((item) => {
            const read = isRead(item);
            const actionHref = getActionHref(item);
            const displayTitle = item.provider ?? item.title;
            const subtitleType = item.category ?? formatTypeLabel(item.type);

            return (
              <Card
                key={item.notificationId}
                className={`bg-white w-full ${!read ? "ring-1 ring-primary/10" : ""}`}
              >
                <CardContent>
                  <div className="flex items-center justify-between pb-4 border-b border-dashed">
                    <div className="flex items-center gap-x-4 min-w-0">
                      <div className="p-0.5 bg-white rounded-lg shrink-0">
                        <Image
                          src={item.providerLogo ?? DEFAULT_LOGO}
                          alt={displayTitle}
                          width={44}
                          height={44}
                          className="object-contain rounded-md overflow-hidden"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-xl leading-6 tracking-4 text-accent-foreground truncate">
                          {displayTitle}
                        </span>
                        <div className="flex items-center gap-x-1.5 pt-1.5 flex-wrap">
                          <div className="flex gap-x-1 items-center">
                            {getSubtitleIcon(item)}
                            <span className="text-base font-medium leading-5 tracking-4 text-accent-foreground">
                              {subtitleType}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {actionHref ? (
                      <Button
                        variant="outline"
                        size="lg"
                        className="shrink-0 ml-4"
                        onClick={() => {
                          markAsRead(item.notificationId);
                          router.push(actionHref);
                        }}
                      >
                        View Details
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="lg"
                        className="shrink-0 ml-4"
                        onClick={() => markAsRead(item.notificationId)}
                      >
                        Mark read
                      </Button>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-4 pt-4 flex-wrap">
                    <div className="flex text-sm flex-col min-w-[100px]">
                      <span className="text-muted-foreground text-base font-medium leading-5 tracking-4">
                        Category
                      </span>
                      <span className="text-accent-foreground text-lg font-medium leading-6 tracking-4 capitalize">
                        {formatTypeLabel(item.type)}
                      </span>
                    </div>
                    <div className="flex text-sm flex-col min-w-[100px]">
                      <span className="text-muted-foreground text-base font-medium leading-5 tracking-4 pb-1">
                        Priority
                      </span>
                      <Badge
                        {...getPriorityBadge(item.priority)}
                        size="md"
                        className="mt-1 w-fit capitalize"
                      >
                        {item.priority}
                      </Badge>
                    </div>
                    <div className="flex text-sm flex-col min-w-[100px]">
                      <span className="text-muted-foreground text-base font-medium leading-5 tracking-4">
                        Received
                      </span>
                      <span className="text-accent-foreground text-lg font-medium leading-6 tracking-4">
                        {formatDateShort(item.timestamp)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {notifications.length > 0 && (
            <div className="flex flex-col items-center gap-4 pt-2">
              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((p) => Math.max(1, p - 1));
                        }}
                        className={cn(
                          currentPage === 1 && "pointer-events-none opacity-50",
                        )}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            isActive={page === currentPage}
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                            }}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ),
                    )}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((p) => Math.min(totalPages, p + 1));
                        }}
                        className={cn(
                          currentPage === totalPages &&
                            "pointer-events-none opacity-50",
                        )}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
