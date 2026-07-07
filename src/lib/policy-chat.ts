export type PolicyChatContext = {
  policyId: string;
  provider: string;
  type: string;
};

export function buildPolicyChatSearchUrl(policy: PolicyChatContext): string {
  const params = new URLSearchParams({
    policyId: policy.policyId,
    provider: policy.provider,
    type: policy.type,
  });
  return `/search?${params.toString()}`;
}

export function getPolicyChatContextFromSearchParams(
  searchParams: Pick<URLSearchParams, "get">,
): PolicyChatContext | null {
  const policyId = searchParams.get("policyId");
  const provider = searchParams.get("provider");
  const type = searchParams.get("type");

  if (!policyId || !provider) return null;

  return {
    policyId,
    provider,
    type: type ?? "Policy",
  };
}

export function getPolicyFileMetaFromContext(context: PolicyChatContext) {
  const safeProvider = context.provider.replace(/\s+/g, "-");
  const safePolicyId = context.policyId.replace(/[^a-zA-Z0-9-_]/g, "");

  return {
    name: `${safeProvider}-${safePolicyId || "policy"}.pdf`,
    sizeMb: 1,
  };
}

export function getPolicyChatIntroMessage(
  context: PolicyChatContext | null,
): string {
  if (!context) {
    return "Upload complete. Ask me anything about your policy — deductibles, coverage, exclusions, renewals, or claim steps.";
  }

  return `Your ${context.provider} policy (${context.policyId}) is ready. Ask me anything about coverage, deductibles, renewals, or claim steps.`;
}
