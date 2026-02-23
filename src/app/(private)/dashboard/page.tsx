"use client";
import { Button } from "@/components/ui/button";
import { CircleAlert, PlusIcon } from "lucide-react";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
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

interface ApiResponse {
  endpoints: {
    policies: {
      getAllPolicies: {
        response: Policy[];
      };
    };
  };
}

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

  const setMember = (
    index: number,
    field: "name" | "avatar",
    value: string,
  ) => {
    setFormData((prev) => {
      const members = [...prev.members];
      if (!members[index]) members[index] = { name: "", avatar: "" };
      members[index] = { ...members[index], [field]: value };
      return { ...prev, members };
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

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={handleModalOpenChange}>
        <DialogContent size="lg">
          <DialogHeader>Enter Policy Details Manually</DialogHeader>
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
          <h3 className="font-medium text-3xl leading-8 tracking-4">
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

        {!loading && !error && policies.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">No policies found.</p>
              <Button
                className="gap-0.5"
                onClick={() => handleModalOpenChange(true)}
              >
                <PlusIcon className="size-5" /> Add Your First Policy
              </Button>
            </div>
          </div>
        )}
        {!loading && !error && policies.length > 0 && (
          <div className="flex gap-4 overflow-x-auto">
            {policies.map((policy) => (
              <PolicyCard key={policy.policyId} policy={policy} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default DashboardPage;
