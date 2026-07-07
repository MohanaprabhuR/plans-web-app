"use client";
import {
  ReactNode,
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { toast } from "sonner";
import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  BriefcaseMedical,
  CarFront,
  CircleAlert,
  Heart,
  House,
  PlaneTakeoff,
  ShieldCheck,
  SquareChartGantt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import PolicyListCard from "@/components/BaseComponents/common/policyList";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useRouter } from "next/navigation";
import { PageLoadState } from "@/components/ui/page-load-state";
import { useUserFetch } from "@/hooks/useUserFetch";
import {
  setPolicyPurchaseReturnTo,
  usePolicyPurchaseSuccessToast,
} from "@/lib/policy-purchase";

interface Policy {
  policyId: string;
  type: string;
  status: string;
  provider: string;
  providerLogo: string;
  coverage: string;
  premium: string;
  claimAmount: string;
  members: Array<{ name: string; avatar: string }>;
  daysLeft: number;
  renewalDate: string;
  policyTerm: string;
}

interface ApiResponse {
  endpoints: {
    policies: {
      getAllPolicies: {
        response: Policy[];
      };
    };
    premiumOverview?: {
      getPremiumSummary?: {
        response?: {
          totalYearlyPremium?: number;
          totalPolicies?: number;
          breakdown?: {
            category: string;
            yearlyPremium: number;
            policyCount: number;
          }[];
        };
      };
    };
    claims?: {
      getAllClaims?: {
        response?: Array<{
          amount: ReactNode;
          claimAmount: ReactNode;
          submittedDate: ReactNode;
          provider: ReactNode;
          title: ReactNode;
          status: ReactNode;
          type: ReactNode;
          claimId: string;
        }>;
      };
    };
    riskAssessment?: {
      getRiskScore?: {
        response?: {
          overallScore?: number;
          riskLevel?: string;
          assetFactors?: Array<Record<string, unknown>>;
          personalFactors?:
            | Array<Record<string, unknown>>
            | Record<string, unknown>;
        };
      };
    };
    expiry?: {
      getExpiry?: {
        response?: Array<{
          policyId: string;
          type: string;
          dueDate: string;
          daysLeft: number;
        }>;
      };
    };
  };
}

const POLICIES_PAGE_SIZE = 5;

const YourPolicyPage = () => {
  const {
    data: apiData,
    loading,
    error,
    refetch: fetchPolicies,
    setError,
  } = useUserFetch<ApiResponse>("/api/policy", [], {
    errorFallback: "Failed to load policies.",
    onError: (errorMessage) => {
      toast.custom(() => (
        <Alert variant="error">
          <CircleAlert className="size-4" />
          <AlertTitle>Failed to load policies: {errorMessage}</AlertTitle>
        </Alert>
      ));
    },
  });
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const autoplay = useRef(
    Autoplay({
      delay: 3000,
      stopOnInteraction: true,
    }),
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    autoplay.current,
  ]);

  useEffect(() => {
    if (emblaApi) emblaApi.reInit();
  }, [apiData, emblaApi]);

  usePolicyPurchaseSuccessToast(() => {
    void fetchPolicies();
  });

  const policies: Policy[] = useMemo(() => {
    return apiData?.endpoints?.policies?.getAllPolicies?.response ?? [];
  }, [apiData]);

  const totalPages = Math.max(
    1,
    Math.ceil(policies.length / POLICIES_PAGE_SIZE),
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [policies.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const visiblePolicies = useMemo(() => {
    const start = (currentPage - 1) * POLICIES_PAGE_SIZE;
    return policies.slice(start, start + POLICIES_PAGE_SIZE);
  }, [policies, currentPage]);

  return (
    <>
      <h3 className="font-semibold text-3xl leading-8 tracking-4 text-accent-foreground">
        Your Policy
      </h3>
      <PageLoadState
        loading={loading}
        error={error}
        onRetry={() => {
          setError(null);
          void fetchPolicies();
        }}
        preset="your-policy"
      >
      {!loading && !error && (
        <div className="w-full flex gap-x-6 pt-8">
          <div className="w-full flex flex-col gap-y-6 max-w-[730px] ">
            <div className="embla overflow-hidden">
              <div className="embla__viewport overflow-hidden" ref={emblaRef}>
                <div className="embla__container flex gap-4">
                  {apiData?.endpoints?.expiry?.getExpiry?.response?.map(
                    (expiry, expiryIndex) => (
                      <Card
                        className="gap-4 embla__slide flex-[0_0_100%] "
                        key={`${expiry.policyId}-${expiry.type}-${expiryIndex}`}
                      >
                        <CardContent className="flex items-center justify-between">
                          <div className="flex items-center gap-x-4">
                            <div className="size-12 rounded-full bg-accent flex items-center justify-center">
                              {expiry.type === "Health" ? (
                                <BriefcaseMedical className="size-5.5 stroke-[#8E51FF]" />
                              ) : expiry.type === "Home" ? (
                                <House className="size-5.5 stroke-[#FE9A00]" />
                              ) : expiry.type === "Life" ? (
                                <Heart className="size-5.5 stroke-[#FF5255]" />
                              ) : expiry.type === "Travel" ? (
                                <PlaneTakeoff className="size-5.5 stroke-[#00D3F2]" />
                              ) : expiry.type === "Auto" ? (
                                <CarFront className="size-5.5 stroke-[#E12AFB]" />
                              ) : null}
                            </div>
                            <div className="flex flex-col">
                              <p className="text-base leading-6 font-medium text-foreground">
                                {`Your ${expiry.type} insurance expires in ${expiry.daysLeft} days!`}
                              </p>
                              <p className="text-base leading-6 font-medium text-muted-foreground">
                                {`Due on: ${expiry.dueDate}`}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="lg"
                            onClick={() =>
                              router.push(
                                `/renewal?policyId=${expiry.policyId}`,
                              )
                            }
                          >
                            Renew Now
                          </Button>
                        </CardContent>
                      </Card>
                    ),
                  )}
                </div>
              </div>
            </div>
            {policies.length === 0 ? (
              <p className="text-muted-foreground">No policies found</p>
            ) : (
              <>
                {visiblePolicies.map((policy, policyIndex) => (
                  <PolicyListCard
                    key={`${policy.policyId}-${policy.type}-${policyIndex}`}
                    policy={policy}
                  />
                ))}
                {totalPages > 1 && (
                  <div className="flex flex-col items-center gap-4 pt-2">
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
                              currentPage === 1 &&
                                "pointer-events-none opacity-50",
                            )}
                          />
                        </PaginationItem>
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1,
                        ).map((page) => (
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
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage((p) =>
                                Math.min(totalPages, p + 1),
                              );
                            }}
                            className={cn(
                              currentPage === totalPages &&
                                "pointer-events-none opacity-50",
                            )}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="w-full max-w-[354px] min-w-[354px] flex flex-col gap-y-6">
            <Card className="gap-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-x-2 font-semibold">
                  <ShieldCheck className="size-5" /> Buy Insurance
                </CardTitle>
              </CardHeader>
              <CardContent className=" flex flex-wrap gap-4">
                <Button
                  onClick={() => {
                    setPolicyPurchaseReturnTo("/your-policy");
                    router.push(
                      `/buy-insurance?type=${encodeURIComponent("Health")}`,
                    );
                  }}
                  className="w-full max-w-[150px] justify-start"
                  variant="shadow"
                  size="lg"
                >
                  <BriefcaseMedical />
                  Health
                </Button>
                <Button
                  onClick={() => {
                    setPolicyPurchaseReturnTo("/your-policy");
                    router.push(
                      `/buy-insurance?type=${encodeURIComponent("Home")}`,
                    );
                  }}
                  className="w-full max-w-[150px] justify-start"
                  variant="shadow"
                  size="lg"
                >
                  <House />
                  Home
                </Button>
                <Button
                  onClick={() => {
                    setPolicyPurchaseReturnTo("/your-policy");
                    router.push(
                      `/buy-insurance?type=${encodeURIComponent("Life")}`,
                    );
                  }}
                  className="w-full max-w-[150px] justify-start"
                  variant="shadow"
                  size="lg"
                >
                  <Heart />
                  Life
                </Button>
                <Button
                  onClick={() => {
                    setPolicyPurchaseReturnTo("/your-policy");
                    router.push(
                      `/buy-insurance?type=${encodeURIComponent("Travel")}`,
                    );
                  }}
                  className="w-full max-w-[150px] justify-start"
                  variant="shadow"
                  size="lg"
                >
                  <PlaneTakeoff />
                  Travel
                </Button>
                <Button
                  onClick={() => {
                    setPolicyPurchaseReturnTo("/your-policy");
                    router.push(
                      `/buy-insurance?type=${encodeURIComponent("Auto")}`,
                    );
                  }}
                  className="w-full max-w-[150px] justify-start"
                  variant="shadow"
                  size="lg"
                >
                  <CarFront />
                  Auto
                </Button>
              </CardContent>
            </Card>
            <Card className="gap-4">
              <CardHeader className="flex items-start justify-between ">
                <CardTitle className="flex items-center gap-x-2 font-semibold">
                  <SquareChartGantt className="size-5" /> Recent Claims
                </CardTitle>
              </CardHeader>
              <CardContent className="flex  flex-col gap-3">
                {apiData?.endpoints?.claims?.getAllClaims?.response?.map(
                  (claim) => (
                    <div
                      key={claim.claimId}
                      className="flex items-center first:pt-2 gap-x-3 pb-4 border-b border-border last:border-b-0 last:pb-0"
                    >
                      <div className="w-14 min-w-14 max-w-14 min-h-14 max-h-14 p-2.5 h-14 bg-accent rounded-lg flex flex-col items-center justify-center">
                        <p className="text-base leading-none font-medium text-accent-foreground text-center">
                          {claim.submittedDate}
                        </p>
                      </div>
                      <div className="flex flex-col gap-y-2 w-full">
                        <p className="font-semibold text-xl leading-6 text-accent-foreground tracking-4">
                          {claim.title}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-x-1.5">
                            <p className="text-base leading-6 font-medium text-accent-foreground">
                              {claim.type}
                            </p>

                            <div className="bg-accent-foreground size-1 rounded-full"></div>
                            <p className="text-base leading-6 font-medium text-accent-foreground">
                              {claim.claimId}
                            </p>
                          </div>
                          <Badge theme="amber" size="md">
                            {claim.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      </PageLoadState>
    </>
  );
};

export default YourPolicyPage;
