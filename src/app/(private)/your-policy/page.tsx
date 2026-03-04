/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import useAuth from "@/hooks/useAuth";
import {
  useCallback,
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
import PolicyListCard from "@/components/BaseComponents/common/policyList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";

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

const page = () => {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const autoplay = useRef(
    Autoplay({
      delay: 3000,
      stopOnInteraction: true,
    }),
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    autoplay.current,
    Fade(),
  ]);

  useEffect(() => {
    if (emblaApi) emblaApi.reInit();
  }, [apiData, emblaApi]);

  const fetchPolicies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/policy", {
        cache: "no-store",
        headers: { "X-User-Id": userId },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch policies: ${response.status} ${response.statusText}. ${errorText}`,
        );
      }

      const data = await response.json();
      setApiData(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);

      toast.custom(() => (
        <Alert variant="error">
          <CircleAlert className="size-4" />
          <AlertTitle>Failed to load policies: {errorMessage}</AlertTitle>
        </Alert>
      ));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const policies: Policy[] = useMemo(() => {
    return apiData?.endpoints?.policies?.getAllPolicies?.response ?? [];
  }, [apiData]);

  return (
    <>
      <h3 className="font-semibold text-3xl leading-8 tracking-4 text-accent-foreground">
        Your Policy
      </h3>
      {loading && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading policies...</p>
        </div>
      )}
      {error && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-2">
              Error: {error}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setError(null);
                setLoading(true);
                fetch("/api/policy", {
                  headers: { "X-User-Id": userId },
                })
                  .then((res) => res.json())
                  .then((data) => {
                    setApiData(data);
                    setLoading(false);
                  })
                  .catch((err) => {
                    setError(err.message);
                    setLoading(false);
                  });
              }}
            >
              Retry
            </Button>
          </div>
        </div>
      )}
      <div className="w-full flex gap-x-6 pt-8">
        <div className="w-full flex flex-col gap-y-6 max-w-[730px] ">
          <div className="embla overflow-hidden">
            <div className="embla__viewport overflow-hidden" ref={emblaRef}>
              <div className="embla__container flex gap-4">
                {apiData?.endpoints?.expiry?.getExpiry?.response?.map(
                  (expiry) => (
                    <Card
                      className="gap-4 embla__slide flex-[0_0_100%] "
                      key={expiry.policyId}
                    >
                      <CardContent className="flex items-center justify-between">
                        <div className="flex items-center gap-x-4">
                          <div className="size-12 rounded-full bg-accent flex items-center justify-center">
                            <BriefcaseMedical className="size-5.5" />
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
                        <Button size="lg">Renew Now</Button>
                      </CardContent>
                    </Card>
                  ),
                )}
              </div>
            </div>
          </div>
          {!loading && !error && (
            <>
              {policies.length === 0 ? (
                <p className="text-muted-foreground">No policies found</p>
              ) : (
                policies.map((policy) => (
                  <PolicyListCard key={policy.policyId} policy={policy} />
                ))
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
                className="w-full max-w-[150px] justify-start"
                variant="shadow"
                size="lg"
              >
                <BriefcaseMedical />
                Health
              </Button>
              <Button
                className="w-full max-w-[150px] justify-start"
                variant="shadow"
                size="lg"
              >
                <House />
                Home
              </Button>
              <Button
                className="w-full max-w-[150px] justify-start"
                variant="shadow"
                size="lg"
              >
                <Heart />
                Life
              </Button>
              <Button
                className="w-full max-w-[150px] justify-start"
                variant="shadow"
                size="lg"
              >
                <PlaneTakeoff />
                Travel
              </Button>
              <Button
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
    </>
  );
};

export default page;
