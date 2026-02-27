/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import useAuth from "@/hooks/useAuth";
import { useCallback, ReactNode, useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import PolicyListCard from "@/components/BaseComponents/common/policyList";

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
  };
}
const page = () => {
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

  console.log(policies, "policies");

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

      {!loading && !error && (
        <div className="flex flex-col gap-6 pt-8">
          {policies.length === 0 ? (
            <p className="text-muted-foreground">No policies found</p>
          ) : (
            policies.map((policy) => (
              <PolicyListCard key={policy.policyId} policy={policy} />
            ))
          )}
        </div>
      )}
    </>
  );
};

export default page;
