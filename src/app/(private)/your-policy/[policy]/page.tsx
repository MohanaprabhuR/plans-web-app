/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import PolicyListCard from "@/components/BaseComponents/common/policyList";
import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useAuth from "@/hooks/useAuth";
import {
  Blend,
  CarFront,
  ChevronLeft,
  CircleAlert,
  CircleCheck,
  CircleSlash,
  CircleX,
  Download,
  Hospital,
  House,
  Icon,
  LifeBuoy,
  PlaneTakeoff,
  SearchCodeIcon,
  SearchIcon,
  ShieldCheck,
  SquareChartGantt,
  User,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

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

const policyIndividualPage = () => {
  const router = useRouter();
  const params = useParams<{ policy: string }>();
  const policyIdFromRoute = useMemo(() => {
    const raw = params?.policy ?? "";
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }, [params?.policy]);

  const { user } = useAuth();
  const userId = user?.id ?? "";
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const policy = useMemo(
    () => policies.find((p) => p.policyId === policyIdFromRoute) ?? null,
    [policies, policyIdFromRoute],
  );

  const coverage = [
    {
      id: 1,
      title: "Hospitalization",
      description:
        "Hospitalisation over 24 hrs covered up to sum insured as per policy terms.",
      icon: "Hospital",
    },
    {
      id: 2,
      title: "Family Definition",
      description:
        "Covers you and your family up to the sum insured during the policy term.",
      icon: "Users",
    },
    {
      id: 3,
      title: "Day Care Treatments",
      description:
        "Covers short-stay treatments such as cataract or angiography.",
      icon: "Bandage",
    },
    {
      id: 4,
      title: "Room Rent Limit",
      description:
        "ICU room rent covered up to 4% and normal room up to 2% of the sum insured.",
      icon: "School",
    },
    {
      id: 5,
      title: "Co-Pay",
      description:
        "Co-payment means you share part of the medical cost with your insurer.",
      icon: "WalletCards",
    },
    {
      id: 6,
      title: "Maternity",
      description:
        "Covers up to ₹50,000 for first two deliveries including Normal/C-Section.",
      icon: "Baby",
    },
    {
      id: 7,
      title: "Pre & Post Expenses",
      description:
        "Pre and post natal expenses up to ₹5,000 within maternity limit.",
      icon: "BanknoteArrowDown",
    },
    {
      id: 8,
      title: "Newborn Baby",
      description:
        "Newborn babies are covered from day 1. Routine checkups not included.",
      icon: "Baby",
    },
    {
      id: 9,
      title: "Pre-existing Disease",
      description: "Pre-existing diseases are covered with no waiting period.",
      icon: "Rat",
    },
    {
      id: 10,
      title: "Pre/Post Hospitalisation",
      description:
        "Covers expenses 60 days before and 90 days after hospitalisation.",
      icon: "Hospital",
    },
    {
      id: 11,
      title: "Ambulance Coverage",
      description:
        "Road ambulance charges are limited to ₹1,000 per hospitalisation.",
      icon: "CardSim",
    },
    {
      id: 12,
      title: "Lasik Surgery",
      description: "Lasik and PRK covered when eye power exceeds ±6.5D.",
      icon: "BriefcaseMedical",
    },
    {
      id: 13,
      title: "Ayush Treatment",
      description:
        "Covers AYUSH care in govt. hospitals up to 25% of sum insured.",
      icon: "Bandage",
    },
    {
      id: 14,
      title: "Psychiatric Ailments",
      description:
        "Psychiatric care covered up to ₹50,000 if hospitalised over 24 hrs.",
      icon: "Hospital",
    },
    {
      id: 15,
      title: "Covid-19 Treatments",
      description:
        "Coverage for COVID-19 with positive test and 24+ hr hospital stay.",
      icon: "Hospital",
    },
  ];

  const notCovered = [
    {
      id: 1,
      title: "Consumables",
      description:
        "Covers disposable items such as gowns, gloves, syringes, and masks.",
      icon: "roll",
    },
    {
      id: 2,
      title: "Infertility Treatments",
      description:
        "Infertility treatments such as IVF and surrogacy will not be covered under the policy.",
      icon: "ban",
    },
    {
      id: 3,
      title: "Foreign Treatment",
      description: "Treatments taken outside India are not covered.",
      icon: "globe",
    },
    {
      id: 4,
      title: "Homecare Treatment",
      description: "Homecare treatments that do not require hospitalisation.",
      icon: "home",
    },
    {
      id: 5,
      title: "OPD",
      description:
        "OPD care excluded unless it needs 24-hr stay or qualifies as daycare.",
      icon: "stethoscope",
    },
    {
      id: 6,
      title: "Dental",
      description:
        "Covers dental treatment only after accidents needing 24+ hr stay.",
      icon: "tooth",
    },
    {
      id: 7,
      title: "External Congenital",
      description:
        "External congenital not covered except in life-threatening conditions.",
      icon: "bone",
    },
  ];
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="lg"
          iconOnly
          onClick={() => router.push("/your-policy")}
        >
          <ChevronLeft />
        </Button>

        <h3 className="text-2xl font-semibold tracking-4 text-foreground">
          Policy Details
        </h3>
      </div>
      <div className="flex gap-x-6">
        <div className="flex flex-col gap-6">
          {loading && <p className="text-muted-foreground">Loading policy…</p>}
          {!loading && error && (
            <Alert variant="error">
              <CircleAlert className="size-4" />
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          )}
          {!loading && !error && !policy && (
            <Alert variant="error">
              <CircleAlert className="size-4" />
              <AlertTitle>
                Policy not found:{" "}
                <span className="font-semibold">{policyIdFromRoute}</span>
              </AlertTitle>
            </Alert>
          )}
          {!loading && !error && policy && (
            <Card className="bg-[linear-gradient(180deg,#F5F0FF_0%,rgba(245,240,255,0)_80%)]">
              <CardContent>
                <div className="flex items-center justify-between pb-4 border-b border-dashed">
                  <div className="flex items-center gap-x-4">
                    <div className="p-0.5 bg-white rounded-lg">
                      <Image
                        src={
                          policy.providerLogo ||
                          "https://img.freepik.com/free-vector/insurance-policy-shield_603843-179.jpg"
                        }
                        alt={`${policy.provider}`}
                        width={44}
                        height={44}
                        className="object-contain rounded-md overflow-hidden"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-xl leading-6 tracking-4 text-accent-foreground">
                        {policy.provider}
                      </span>
                      <div className="flex items-center gap-x-1.5 pt-1.5">
                        <div className="flex gap-x-1 items-center">
                          {policy.type === "Health" && (
                            <Hospital className="size-5 min-w-5 text-[#8E51FF]" />
                          )}
                          {policy.type === "Auto" && (
                            <CarFront className="size-5 min-w-5 text-[#E12AFB]" />
                          )}
                          {policy.type === "Life" && (
                            <LifeBuoy className="size-5 min-w-5 text-[#FE9A00]" />
                          )}
                          {policy.type === "Travel" && (
                            <PlaneTakeoff className="size-5 min-w-5 text-[#FE9A00]" />
                          )}
                          {policy.type === "Home" && (
                            <House className="size-5 min-w-5 text-[#FE9A00]" />
                          )}
                          <span className="text-base font-medium leading-5 tracking-4 text-accent-foreground">
                            {policy.type}
                          </span>
                        </div>
                        <div className="size-1 rounded-full bg-[#757575]"></div>
                        <span className="text-base font-medium leading-5 tracking-4 text-accent-foreground">
                          {policy.policyId}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" size="md">
                    <Download />
                    Download Policy
                  </Button>
                </div>
                <div className="flex items-center justify-between pt-4">
                  <div className="flex text-sm flex-col">
                    <span className="text-muted-foreground text-base font-medium leading-5 tracking-4">
                      Coverage Amount
                    </span>
                    <span className="text-accent-foreground text-lg font-medium leading-6 tracking-4">
                      {policy.coverage}
                    </span>
                  </div>

                  <div className="flex text-sm flex-col">
                    <span className="text-muted-foreground text-base font-medium leading-5 tracking-4">
                      Premium
                    </span>
                    <span className="text-accent-foreground text-lg font-medium leading-6 tracking-4">
                      {policy.premium}
                    </span>
                  </div>
                  <div className="flex text-sm flex-col">
                    <span className="text-muted-foreground">Claims Amt</span>
                    <span className="font-medium">{policy.claimAmount}</span>
                  </div>
                  <div className="flex text-sm flex-col">
                    <span className="text-muted-foreground">Valid on</span>
                    <span className="font-medium">{policy.renewalDate}</span>
                  </div>
                  <div className="flex text-sm flex-col">
                    <span className="text-muted-foreground">Members</span>
                    <AvatarGroup max={3} size="md">
                      {policy.members.map((member, index) => (
                        <Avatar key={index} size="md">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </AvatarGroup>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <div className="w-full flex items-center justify-between pt-2">
            <h3 className="font-semibold text-xl leading-6 tracking-4">
              Know Your Coverage
            </h3>

            <Button variant="outline" size="md">
              <SearchIcon />
              Ask about your policy
            </Button>
          </div>
          <Tabs defaultValue="coverage" variant="subtle">
            <TabsList className="w-full">
              <TabsTrigger value="coverage" className="w-full">
                <CircleCheck /> Coverage
              </TabsTrigger>
              <TabsTrigger value="not-covered" className="w-full">
                <CircleX />
                Not Covered
              </TabsTrigger>
            </TabsList>
            <TabsContent value="coverage" className="px-0">
              <div className="flex flex-wrap gap-6">
                {coverage.map((item) => (
                  <Card
                    key={item.id}
                    className="w-full max-w-[228px] min-w-[228px]"
                  >
                    <CardContent className="flex flex-col gap-4">
                      <Blend className="size-8 text-orange-500" />
                      <div className="flex flex-col gap-1.5">
                        <p className="text-lg font-semibold leading-6 tracking-4 text-accent-foreground">
                          {item.title}
                        </p>
                        <p className="text-base font-medium leading-5 tracking-4   text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="not-covered" className="px-0">
              <div className="flex flex-wrap gap-6">
                {notCovered.map((item) => (
                  <Card
                    key={item.id}
                    className="w-full max-w-[228px] min-w-[228px]"
                  >
                    <CardContent className="flex flex-col gap-4">
                      {/* {item.icon} */}
                      <CircleSlash className="size-8 text-red-500" />
                      <div className="flex flex-col gap-1.5">
                        <p className="text-lg font-semibold leading-6 tracking-4 text-accent-foreground">
                          {item.title}
                        </p>
                        <p className="text-base font-medium leading-5 tracking-4   text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <div className="w-full max-w-[354px] min-w-[354px] flex flex-col gap-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-x-2 font-semibold">
                <User className="size-5" /> Insured Members
                <Badge variant="secondary">{policy?.members.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {policy?.members.map((member, idx) => (
                <div
                  key={`${member.name}-${idx}`}
                  className="flex gap-x-3 border-b py-4 first:border-t-0 last:border-b-0 first:pt-0 last:pb-0"
                >
                  <Image
                    src={
                      member.avatar ||
                      "https://mockmind-api.uifaces.co/content/human/185.jpg"
                    }
                    alt={member.name || "avatar"}
                    width={42}
                    height={42}
                    className="object-cover w-[42px] h-[42px] min-w-[42px] min-h-[42px] rounded-full overflow-hidden"
                  />
                  <div>
                    <p className="text-xl font-semibold leading-6 tracking-4 text-accent-foreground">
                      {member.name}
                    </p>
                  </div>
                </div>
              ))}
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
    </div>
  );
};

export default policyIndividualPage;
