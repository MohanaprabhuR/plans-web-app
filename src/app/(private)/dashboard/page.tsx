"use client";
import { Button } from "@/components/ui/button";
import {
  ArrowDownToLine,
  Ban,
  BriefcaseMedical,
  CarFront,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleX,
  CornerRightDown,
  Heart,
  House,
  MessageSquareText,
  PlaneTakeoff,
  Plus,
  PlusIcon,
  ShieldCheck,
  SquareChartGantt,
  XIcon,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState, useMemo, ReactNode } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PolicyCard from "@/components/BaseComponents/common/policyCard";
import useAuth from "@/hooks/useAuth";
import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import QuickActionCard from "@/components/BaseComponents/common/quickActionCard";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer";
import HealthCard from "@/components/BaseComponents/common/healthCard";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { GaugeComponent } from "react-gauge-component";
import dynamic from "next/dynamic";
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
}

interface RiskFactorEntry {
  name?: string;
  status?: string;
  risk?: string;
  level?: string;
  factors?: RiskFactorEntry[];
}

interface RiskFactorItem {
  providerLogo: string | StaticImport;
  name?: string;
  score?: number;
  level?: string;
  coveredBy?: string;
  factors?: RiskFactorEntry[];
  risk?: string;
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
  };
}

const healthCards = [
  {
    id: "1",
    policy_number: "4080254058",
    full_name: "Herman Mavoe",
    relationship: "self",
    dob: "25-05-1996",
    can_download: true,
    avatar: "https://mockmind-api.uifaces.co/content/human/80.jpg",
  },
  {
    id: "2",
    policy_number: "4080254059",
    full_name: "Emily Davis",
    relationship: "spouse",
    dob: "15-09-2009",
    can_download: true,
    avatar: "https://mockmind-api.uifaces.co/content/human/81.jpg",
  },
  {
    id: "3",
    policy_number: "4080254060",
    full_name: "Liam Carter",
    relationship: "child",
    dob: "03-03-2022",
    can_download: true,
    avatar: "https://mockmind-api.uifaces.co/content/human/82.jpg",
  },
];

const quickActions = [
  {
    id: 1,
    name: "Download Policy",
    icon: <ArrowDownToLine className="size-6 text-[#FF5E00]" />,
    type: "drawer",
  },
  {
    id: 2,
    name: "Network Hospitals",
    icon: <Plus className="size-6 text-[#FF5E00]" />,
    type: "link",
    href: "/network-hospital",
  },
  {
    id: 3,
    name: "Blacklisted Hospitals",
    icon: <Ban className="size-6 text-[#FF5E00]" />,
    type: "link",
    href: "/block-list-hospital",
  },
  {
    id: 4,
    name: "Policy AI Chat",
    icon: <MessageSquareText className="size-6 text-[#FF5E00]" />,
    type: "link",
    href: "/policy-ai",
  },
];
const DashboardPage = () => {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [policyId, setPolicyId] = useState("");
  const generatePolicyId = () => {
    const digits = Math.floor(Math.random() * 10 ** 10)
      .toString()
      .padStart(10, "0");
    return `#${digits}`;
  };
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    policyId: "",
    policyName: "",
    policyStatus: "",
    policyProvider: "",
    policyCoverage: "",
    policyPremium: "",
    policyClaimAmount: "",
    policyDaysLeft: "",
    memberCount: 1,
    members: [{ name: "", avatar: "" }] as Array<{
      name: string;
      avatar: string;
    }>,
  });
  useEffect(() => {
    console.log("apiData", apiData);
  }, [apiData]);

  const handleModalOpenChange = (open: boolean) => {
    setIsModalOpen(open);
    if (open) {
      const newId = generatePolicyId();
      setPolicyId(newId);
      setFormData((prev) => ({ ...prev, policyId: newId }));
    }
  };

  const setMemberCount = (count: number) => {
    const n = Math.max(1, Math.min(10, count));
    setFormData((prev) => {
      const members = Array.from({ length: n }, (_, i) =>
        prev.members[i] ? { ...prev.members[i] } : { name: "", avatar: "" },
      );
      return { ...prev, memberCount: n, members };
    });
  };

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

  // Fetch policies from API
  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const policies: Policy[] = useMemo(() => {
    return apiData?.endpoints?.policies?.getAllPolicies?.response ?? [];
  }, [apiData]);

  const assetFactorList = useMemo((): RiskFactorItem[] => {
    const raw =
      apiData?.endpoints?.riskAssessment?.getRiskScore?.response?.assetFactors;
    if (Array.isArray(raw)) return raw as unknown as RiskFactorItem[];
    if (raw && typeof raw === "object")
      return Object.values(raw) as RiskFactorItem[];
    return [];
  }, [apiData]);

  const personalFactorsList = useMemo((): RiskFactorItem[] => {
    const raw =
      apiData?.endpoints?.riskAssessment?.getRiskScore?.response
        ?.personalFactors;
    if (Array.isArray(raw)) return raw as unknown as RiskFactorItem[];
    if (raw && typeof raw === "object")
      return Object.values(raw) as RiskFactorItem[];
    return [];
  }, [apiData]);

  const handleAddPolicy = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      if (
        !policyId ||
        !formData.policyName ||
        !formData.policyStatus ||
        !formData.policyProvider
      ) {
        toast.custom(() => (
          <Alert variant="error">
            <CircleAlert className="size-4" />
            <AlertTitle>
              Please fill Policy Name, Status, and Provider.
            </AlertTitle>
          </Alert>
        ));
        return;
      }

      const daysLeftNum = Number(formData.policyDaysLeft || 0) || 0;

      const members = formData.members
        .slice(0, formData.memberCount)
        .map((m, i) => ({
          name: m.name?.trim() || `Member ${i + 1}`,
          avatar:
            m.avatar?.trim() ||
            `https://mockmind-api.uifaces.co/content/human/${80 + i}.jpg`,
        }))
        .filter((m) => m.name);

      const response = await fetch("/api/policy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": userId,
        },
        body: JSON.stringify({
          policyId,
          type: formData.policyName,
          status: formData.policyStatus,
          provider: formData.policyProvider,
          coverage: formData.policyCoverage,
          premium: formData.policyPremium,
          claimAmount: formData.policyClaimAmount,
          daysLeft: daysLeftNum,
          members,
        }),
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || "Failed to add policy");
      }
      toast.custom(() => (
        <Alert variant="success">
          <CircleAlert className="size-4" />
          <AlertTitle>Policy added</AlertTitle>
        </Alert>
      ));

      handleModalOpenChange(false);
      await fetchPolicies();
    } catch (error) {
      console.error("Error adding policy:", error);
      toast.custom(() => (
        <Alert variant="error">
          <CircleAlert className="size-4" />
          <AlertTitle>Failed to add policy</AlertTitle>
        </Alert>
      ));
    } finally {
      setSubmitting(false);
    }
  };
  const GaugeComponent = dynamic(() => import("react-gauge-component"), {
    ssr: false,
  });

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={handleModalOpenChange}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Enter Policy Details Manually</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel>Policy Id</FieldLabel>
              <Input
                type="text"
                placeholder="Enter Policy Id"
                value={policyId}
                onChange={(e) => {
                  setPolicyId(e.target.value);
                  setFormData((p) => ({ ...p, policyId: e.target.value }));
                }}
              />
            </Field>
          </FieldGroup>
          <div className="flex gap-x-4 items-center">
            <FieldGroup>
              <Field>
                <FieldLabel>Policy Name</FieldLabel>
                <Select
                  value={formData.policyName}
                  onValueChange={(v) =>
                    setFormData((p) => ({ ...p, policyName: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Policy Type" />
                    <SelectContent>
                      <SelectItem value="Health">Health</SelectItem>
                      <SelectItem value="Auto">Auto</SelectItem>
                      <SelectItem value="Life">Life</SelectItem>
                      <SelectItem value="Travel">Travel</SelectItem>
                      <SelectItem value="Home">Home</SelectItem>
                    </SelectContent>
                  </SelectTrigger>
                </Select>
              </Field>
            </FieldGroup>
            <FieldGroup>
              <Field>
                <FieldLabel>Policy Status</FieldLabel>
                <Select
                  value={formData.policyStatus}
                  onValueChange={(v) =>
                    setFormData((p) => ({ ...p, policyStatus: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Policy Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          </div>
          <div className="flex gap-x-4 items-center">
            <FieldGroup>
              <Field>
                <FieldLabel>Policy Provider</FieldLabel>
                <Input
                  type="text"
                  placeholder="Enter Policy Provider"
                  value={formData.policyProvider}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      policyProvider: e.target.value,
                    }))
                  }
                />
              </Field>
            </FieldGroup>
            <FieldGroup>
              <Field>
                <FieldLabel>Policy Coverage</FieldLabel>
                <Input
                  type="text"
                  placeholder="Enter Policy Coverage"
                  value={formData.policyCoverage}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      policyCoverage: e.target.value,
                    }))
                  }
                />
              </Field>
            </FieldGroup>
          </div>
          <div className="flex gap-x-4 items-center">
            <FieldGroup>
              <Field>
                <FieldLabel>Policy Premium</FieldLabel>
                <Input
                  type="text"
                  placeholder="Enter Policy Premium"
                  value={formData.policyPremium}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      policyPremium: e.target.value,
                    }))
                  }
                />
              </Field>
            </FieldGroup>
            <FieldGroup>
              <Field>
                <FieldLabel>Policy Claim Amount</FieldLabel>
                <Input
                  type="text"
                  placeholder="Enter Policy Claim Amount"
                  value={formData.policyClaimAmount}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      policyClaimAmount: e.target.value,
                    }))
                  }
                />
              </Field>
            </FieldGroup>
            <FieldGroup>
              <Field>
                <FieldLabel>Policy Days Left</FieldLabel>
                <Input
                  type="number"
                  placeholder="Enter Policy Days Left"
                  value={formData.policyDaysLeft}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      policyDaysLeft: e.target.value,
                    }))
                  }
                />
              </Field>
            </FieldGroup>
          </div>
          <FieldGroup>
            <Field>
              <FieldLabel>Number of members</FieldLabel>
              <Select
                value={String(formData.memberCount)}
                onValueChange={(v) => setMemberCount(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select count" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} member{n > 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
          <Button
            type="button"
            className="justify-self-end"
            onClick={handleAddPolicy}
            disabled={submitting}
          >
            {submitting ? "Adding..." : "Add Policy"}
          </Button>
        </DialogContent>
      </Dialog>
      <div className="w-full space-y-6">
        <div className="flex justify-between w-full items-center">
          <h3 className="font-semibold text-3xl leading-8 tracking-4">
            My Policies
          </h3>
          <Button
            className="gap-0.5"
            onClick={() => handleModalOpenChange(true)}
          >
            <PlusIcon className="size-5" /> Add
          </Button>
        </div>

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

        {!loading && !error && (
          <div className="flex gap-6 overflow-x-auto scrollbar-hide">
            {policies.length === 0 ? (
              <Card
                className="min-w-[354px] border  bg-muted/30 flex flex-col items-center justify-center py-16 px-6 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleModalOpenChange(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleModalOpenChange(true);
                  }
                }}
              >
                <div className="flex flex-col items-center gap-4 text-center cursor-pointer">
                  <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                    <PlusIcon className="size-6 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-accent-foreground">
                      No policies yet
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Add your first policy to get started
                    </p>
                  </div>
                  <Button
                    className="gap-0.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleModalOpenChange(true);
                    }}
                  >
                    <PlusIcon className="size-5" /> Add Policy
                  </Button>
                </div>
              </Card>
            ) : (
              policies.map((policy) => (
                <PolicyCard key={policy.policyId} policy={policy} />
              ))
            )}
          </div>
        )}
      </div>
      <div className="w-full pt-12 flex gap-x-6">
        <div className="w-full">
          <div className="w-full flex items-center justify-between">
            <div className="flex flex-col  gap-x-2">
              <h3 className="font-semibold text-3xl leading-8 tracking-4">
                Hello! {user?.user_metadata?.full_name || ""}
              </h3>
              <p className="text-accent-foreground font-medium text-xl leading-6 tracking-4">
                Age:32, Male
              </p>
            </div>
            <Button variant="outline" size="md">
              Check Risk Coverage
            </Button>
          </div>

          <GaugeComponent
            className="!max-w-[460px] !w-full mx-auto !h-[380px] max-h-[380px] min-h-[380px]"
            value={
              apiData?.endpoints?.riskAssessment?.getRiskScore?.response
                ?.overallScore
            }
            type="semicircle"
            minValue={0}
            maxValue={100}
            arc={{
              width: 0.43,
              cornerRadius: 7,
              nbSubArcs: 100,
              colorArray: [
                "#FF6467",
                "#FF8A8D",
                "#FDC700",
                "#9AE600",
                "#cccccc",
              ],
              padding: 0.015,
              subArcsStrokeWidth: 0,
              subArcsStrokeColor: "#000000",
              effects: { glow: true, glowBlur: 1, glowSpread: 2 },
              subArcs: [],
            }}
            pointer={{
              type: "arrow",
              elastic: false,
              animationDelay: 200,
              animationDuration: 1400,
              length: 0.87,
              width: 24,
              baseColor: "#ffffff",
              strokeWidth: 0,
              strokeColor: "#000000",
              maxFps: 60,
              animationThreshold: 0.0096,
              color: "#5be12c",
            }}
            labels={{
              valueLabel: {
                matchColorWithArc: true,
                style: {
                  fontSize: "17px",
                  fontWeight: "bold",
                  textShadow: "none",
                },
                offsetY: 25,
                animateValue: true,
              },
              tickLabels: {
                type: "outer",
                hideMinMax: true,
                autoSpaceTickLabels: false,
                ticks: [],
                defaultTickLineConfig: {
                  length: 5,
                  hide: true,
                  color: "#a95b82",
                  width: 2,
                },
                defaultTickValueConfig: {
                  hide: true,
                  style: { fill: "#b30059" },
                },
              },
            }}
          />
          <div className="flex gap-6 justify-between">
            <div className="flex flex-col gap-y-4 w-full">
              <p className="text-base leading-6 font-medium text-muted-foreground flex items-center gap-x-1">
                Personal Factors
                <CornerRightDown className="size-4 relative top-1.5" />
              </p>
              <div className="flex flex-col gap-y-6">
                {personalFactorsList.map((list, index) => {
                  return (
                    <Card className="w-full p-1 pt-4" key={index}>
                      <CardHeader className="flex items-center justify-between px-3">
                        <CardTitle className="flex items-center gap-x-2">
                          {list.name === "Health" ? (
                            <BriefcaseMedical />
                          ) : list.name === "Auto" ? (
                            <CarFront />
                          ) : list.name === "Life" ? (
                            <Heart />
                          ) : list.name === "Home" ? (
                            <House />
                          ) : list.name === "Travel" ? (
                            <PlaneTakeoff />
                          ) : (
                            ""
                          )}
                          {list.name}
                        </CardTitle>
                        <Button variant="outline">
                          {list.level} <ChevronRight />
                        </Button>
                      </CardHeader>
                      <CardContent className="flex justify-between items-start px-3">
                        <div className="flex flex-col gap-y-2.5">
                          {list.factors
                            ?.filter((factor) => factor.risk === "low")
                            .map((factor, index) => (
                              <div
                                key={`low-${index}`}
                                className="flex items-center gap-x-1.5"
                              >
                                <CircleCheck className="size-4 text-white fill-green-600" />
                                <p className="text-base font-medium leading-5 text-foreground">
                                  {factor.name}
                                </p>
                              </div>
                            ))}
                        </div>

                        <div className="flex flex-col gap-y-2.5">
                          {list.factors
                            ?.filter((factor) => factor.risk !== "low")
                            .map((factor, index) => (
                              <div
                                key={`low-${index}`}
                                className="flex items-center gap-x-1.5"
                              >
                                <CircleX className="size-4 text-white fill-red-600" />
                                <p className="text-base font-medium leading-5 text-foreground">
                                  {factor.name}
                                </p>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                      <CardFooter className="flex items-center justify-between bg-muted p-1.5 rounded-b-lg ">
                        <p className="max-w-[200px] text-base leading-6 font-medium text-muted-foreground">
                          Covered by <br />
                          <span className="text-accent-foreground flex-1 font-semibold">
                            {list.coveredBy}
                          </span>
                        </p>
                        <div className="bg-white size-12 p-0.5 rounded-lg">
                          <Image
                            src={list.providerLogo}
                            alt="Care Health Supreme"
                            width={44}
                            height={44}
                            className="object-cover rounded-md overflow-hidden"
                          />
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col gap-y-4 w-full">
              <p className="text-base leading-6 font-medium text-muted-foreground flex items-center gap-x-1">
                Asset Factors
                <CornerRightDown className="size-4 relative top-1.5 " />
              </p>
              <div className="flex flex-col gap-y-6">
                {assetFactorList.map((list, index) => {
                  return (
                    <Card className="w-full p-1 pt-4" key={index}>
                      <CardHeader className="flex items-center justify-between px-3">
                        <CardTitle className="flex items-center gap-x-2">
                          {list.name === "Health" ? (
                            <BriefcaseMedical />
                          ) : list.name === "Auto" ? (
                            <CarFront />
                          ) : list.name === "Life" ? (
                            <Heart />
                          ) : list.name === "Home" ? (
                            <House />
                          ) : list.name === "Travel" ? (
                            <PlaneTakeoff />
                          ) : (
                            ""
                          )}
                          {list.name}
                        </CardTitle>
                        <Button variant="outline">
                          {list.level} <ChevronRight />
                        </Button>
                      </CardHeader>

                      <CardContent className="flex justify-between items-start px-3">
                        <div className="flex flex-col gap-y-2.5">
                          {list.factors
                            ?.filter((factor) => factor.risk === "low")
                            .map((factor, index) => (
                              <div
                                key={`low-${index}`}
                                className="flex items-center gap-x-1.5"
                              >
                                <CircleCheck className="size-4 text-white fill-green-600" />
                                <p className="text-base font-medium leading-5 text-foreground">
                                  {factor.name}
                                </p>
                              </div>
                            ))}
                        </div>

                        <div className="flex flex-col gap-y-2.5">
                          {list.factors
                            ?.filter((factor) => factor.risk !== "low")
                            .map((factor, index) => (
                              <div
                                key={`low-${index}`}
                                className="flex items-center gap-x-1.5"
                              >
                                <CircleX className="size-4 text-white fill-red-600" />
                                <p className="text-base font-medium leading-5 text-foreground">
                                  {factor.name}
                                </p>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                      <CardFooter className="flex items-center justify-between bg-muted p-1.5 rounded-b-lg ">
                        <p className="max-w-[200px] text-base leading-6 font-medium text-muted-foreground">
                          Covered by <br />
                          <span className="text-accent-foreground flex-1 font-semibold">
                            {list.coveredBy}
                          </span>
                        </p>
                        <div className="bg-white size-12 p-0.5 rounded-lg">
                          <Image
                            src={list.providerLogo}
                            alt="Care Health Supreme"
                            width={44}
                            height={44}
                            className="object-cover rounded-md overflow-hidden"
                          />
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="w-full max-w-[354px] flex flex-col gap-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-x-2 font-semibold">
                <Zap className="size-5" /> Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-[15px]">
              {quickActions.map((action) => {
                if (action.type === "drawer") {
                  return (
                    <Drawer key={action.id} direction="right">
                      <DrawerTrigger asChild>
                        <QuickActionCard
                          name={action.name}
                          icon={action.icon}
                        />
                      </DrawerTrigger>

                      <DrawerContent className="space-y-[36px] p-6">
                        <DrawerHeader className="flex flex-row items-center justify-between w-full p-0 mb-[44px]">
                          Download Health Cards
                          <DrawerClose>
                            <XIcon className="size-4" />
                          </DrawerClose>
                        </DrawerHeader>

                        <div className="space-y-[36px]">
                          {healthCards.map((card) => (
                            <HealthCard key={card.id} card={card} />
                          ))}
                        </div>
                      </DrawerContent>
                    </Drawer>
                  );
                }

                if (action.type === "link" && action.href) {
                  return (
                    <Link key={action.id} href={action.href}>
                      <QuickActionCard name={action.name} icon={action.icon} />
                    </Link>
                  );
                }
                return null;
              })}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="gap-0">
              <CardTitle className="flex items-center gap-x-2 font-semibold">
                <ShieldCheck className="size-5" /> Premium Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="gap-4 flex flex-col">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base leading-6  font-medium text-muted-foreground">
                    Total Coverage
                  </p>
                  <p className="text-3xl font-medium leading-8  text-accent-foreground">
                    $
                    {
                      apiData?.endpoints?.premiumOverview?.getPremiumSummary
                        ?.response?.totalYearlyPremium
                    }
                  </p>
                </div>
                <div className="bg-accent size-14 rounded-lg flex items-center justify-center text-center p-2">
                  <p className="text-[8px] leading-3  font-semibold text-muted-foreground uppercase flex flex-col items-center justify-center">
                    <span className="text-accent-foreground font-medium text-3xl">
                      {
                        apiData?.endpoints?.premiumOverview?.getPremiumSummary
                          ?.response?.totalPolicies
                      }
                    </span>
                    policies
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {apiData?.endpoints?.premiumOverview?.getPremiumSummary?.response?.breakdown?.map(
                  (item) => {
                    return (
                      <Card
                        key={item.category}
                        className={`w-full max-w-[154px] p-4 overflow-hidden  bg-no-repeat bg-right ${item.category === "Health" ? "bg-[url(/images/health.png)]" : item.category === "Auto" ? "bg-[url(/images/auto.png)]" : item.category === "Life" ? "bg-[url(/images/life.png)]" : item.category === "Home" ? "bg-[url(/images/home.png)]" : "bg-accent"}`}
                      >
                        <CardContent>
                          <p className="text-base leading-6 font-medium text-muted-foreground">
                            {item.category}
                          </p>
                          <p className="text-base font-medium leading-6 tracking-4 text-accent-foreground">
                            ${item.yearlyPremium}/year
                          </p>
                        </CardContent>
                      </Card>
                    );
                  },
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-start justify-between">
              <CardTitle className="flex items-center gap-x-2 font-semibold">
                <SquareChartGantt className="size-5" /> Claims
              </CardTitle>
              <Button variant="ghost">View All</Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-y-4">
              {apiData?.endpoints?.claims?.getAllClaims?.response?.map(
                (claim) => (
                  <Card className="relative" key={claim.claimId}>
                    <CardContent className="flex flex-col gap-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-x-1.5">
                          <div className="flex items-center gap-x-1.5">
                            {claim.type === "Health" ? (
                              <BriefcaseMedical className="size-5" />
                            ) : claim.type === "Auto" ? (
                              <CarFront className="size-5" />
                            ) : claim.type === "Life" ? (
                              <Heart className="size-5" />
                            ) : claim.type === "Home" ? (
                              <House className="size-5" />
                            ) : claim.type === "Travel" ? (
                              <PlaneTakeoff className="size-5" />
                            ) : (
                              <></>
                            )}
                            <p className="text-base leading-6 font-medium text-accent-foreground">
                              {claim.type}
                            </p>
                          </div>
                          <div className="bg-accent-foreground size-1 rounded-full"></div>
                          <p className="text-base leading-6 font-medium text-accent-foreground">
                            {claim.claimId}
                          </p>
                        </div>
                        <Badge
                          theme="amber"
                          size="md"
                          className="rounded-r-none absolute top-4 right-0"
                        >
                          {claim.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-xl leading-6 text-accent-foreground tracking-4 max-w-[140px]">
                          {claim.title}
                        </p>
                        <p className="font-medium text-6xl leading-12 text-accent-foreground tracking-4">
                          $250
                        </p>
                      </div>
                      <div className="flex items-center justify-between bg-accent p-1.5 rounded-lg">
                        <p className="font-medium text-base leading-5 text-accent-foreground tracking-4 max-w-[130px]">
                          {claim.provider}
                        </p>
                        <p className="font-medium text-base leading-5 text-accent-foreground tracking-4">
                          {claim.submittedDate}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ),
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
