import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  CarFront,
  Hospital,
  House,
  LifeBuoy,
  PlaneTakeoff,
} from "lucide-react";

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

interface PolicyCardProps {
  policy: Policy;
  onClick?: () => void;
}

function getMinimalPolicyLabel(policyId: string) {
  const trimmed = policyId.trim();
  if (!trimmed) return "";
  const segments = trimmed.split("-").filter(Boolean);
  if (segments.length > 1) {
    return `#${segments[segments.length - 1]}`;
  }
  return trimmed.length > 12 ? `…${trimmed.slice(-8)}` : trimmed;
}

const PolicyCard: React.FC<PolicyCardProps> = ({ policy, onClick }) => {
  const minimalPolicyLabel = getMinimalPolicyLabel(policy.policyId);
  // Tint the card with its category's icon colour. Using the palette tokens
  // (rather than baked-in hex) means the wash works on the light surface and
  // the dark one, and stays in step if a category colour changes.
  const getBackgroundClass = () => {
    const wash = "bg-linear-to-b to-transparent";
    switch (policy.type) {
      case "Health":
        return `${wash} from-icon-violet/12 dark:from-icon-violet/20`;
      case "Auto":
        return `${wash} from-icon-fuchsia/12 dark:from-icon-fuchsia/20`;
      case "Life":
        return `${wash} from-icon-rose/12 dark:from-icon-rose/20`;
      case "Travel":
        return `${wash} from-icon-cyan/12 dark:from-icon-cyan/20`;
      case "Home":
        return `${wash} from-icon-amber/12 dark:from-icon-amber/20`;
      default:
        return `${wash} from-muted`;
    }
  };

  const getIcon = () => {
    switch (policy.type) {
      case "Health":
        return <Hospital className="size-5 min-w-5 text-icon-violet" />;
      case "Auto":
        return <CarFront className="size-5 min-w-5 text-icon-fuchsia" />;
      case "Life":
        return <LifeBuoy className="size-5 min-w-5 text-icon-amber" />;
      case "Travel":
        return <PlaneTakeoff className="size-5 min-w-5 text-icon-amber" />;
      case "Home":
        return <House className="size-5 min-w-5 text-icon-amber" />;
      default:
        return null;
    }
  };

  const getProgressColor = () => {
    switch (policy.type) {
      case "Health":
        return "**:data-[slot=progress-indicator]:bg-icon-violet";
      case "Auto":
        return "**:data-[slot=progress-indicator]:bg-icon-fuchsia";
      case "Life":
        return "**:data-[slot=progress-indicator]:bg-icon-amber";
      case "Travel":
        return "**:data-[slot=progress-indicator]:bg-icon-amber";
      case "Home":
        return "**:data-[slot=progress-indicator]:bg-icon-amber";
      default:
        return "**:data-[slot=progress-indicator]:bg-gray-500";
    }
  };

  return (
    <Card
      className={`bg-white min-w-88.5 ${getBackgroundClass()} ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-1.5">
            <div className="flex gap-x-1 items-center">
              {getIcon()}
              <span className="text-base font-medium leading-5 tracking-4 text-accent-foreground">
                {policy.type}
              </span>
            </div>
            <div className="size-1 rounded-full bg-icon-muted"></div>
            <span className="text-base font-medium leading-5 tracking-4 text-accent-foreground">
              {policy.status}
            </span>
          </div>
          <span
            className="text-sm font-medium leading-5 tracking-4 text-muted-foreground truncate max-w-[88px]"
            title={policy.policyId}
          >
            {minimalPolicyLabel}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <div className="flex justify-between items-center w-full">
            <div className="flex flex-col">
              <span
                className="font-medium text-xl leading-6 tracking-4 text-accent-foreground truncate max-w-[200px]"
                title={policy.provider}
              >
                {policy.provider}
              </span>
              <span className="text-muted-foreground text-base font-medium leading-6 tracking-4">
                Coverage:&nbsp;{policy.coverage}
              </span>
            </div>
            <div className="p-0.5 bg-background dark:bg-card rounded-lg">
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
          </div>
        </div>
        <div className="flex justify-between">
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
            <span className="text-muted-foreground">Members</span>
            <AvatarGroup max={3} size="md">
              {policy.members.map((member, index) => (
                <Avatar key={index} size="md">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>
          </div>
        </div>
        <div className="flex items-center text-sm mt-1">
          <Progress
            value={Math.max(0, Math.min(100, 100 - policy.daysLeft))}
            className={getProgressColor()}
          />
          <Button variant="outline">{policy.daysLeft} days left</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PolicyCard;
