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

const PolicyCard: React.FC<PolicyCardProps> = ({ policy, onClick }) => {
  const getBackgroundClass = () => {
    switch (policy.type) {
      case "Health":
        return "bg-[linear-gradient(180deg,#F5F0FF_0%,#FFFFFF_60%)]";
      case "Auto":
        return "bg-[linear-gradient(180deg,#FCEFFF_0%,#FFFFFF_100%)]";
      case "Life":
        return "bg-[linear-gradient(180deg,#F5F0FF_0%,#FFFFFF_100%)]";
      case "Travel":
        return "bg-[linear-gradient(180deg,#FFF4E5_0%,#FFFFFF_100%)]";
      case "Home":
        return "bg-[linear-gradient(180deg,#FFF4E5_0%,#FFFFFF_100%)]";
      default:
        return "bg-gray-500";
    }
  };

  const getIcon = () => {
    switch (policy.type) {
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
  };

  const getProgressColor = () => {
    switch (policy.type) {
      case "Health":
        return "**:data-[slot=progress-indicator]:bg-[#8E51FF]";
      case "Auto":
        return "**:data-[slot=progress-indicator]:bg-[#E12AFB]";
      case "Life":
        return "**:data-[slot=progress-indicator]:bg-[#FE9A00]";
      case "Travel":
        return "**:data-[slot=progress-indicator]:bg-[#FE9A00]";
      case "Home":
        return "**:data-[slot=progress-indicator]:bg-[#FE9A00]";
      default:
        return "**:data-[slot=progress-indicator]:bg-gray-500";
    }
  };

  return (
    <Card
      className={`bg-white min-w-[354px] ${getBackgroundClass()} ${onClick ? "cursor-pointer" : ""}`}
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
            <div className="size-1 rounded-full bg-[#757575]"></div>
            <span className="text-base font-medium leading-5 tracking-4 text-accent-foreground">
              {policy.status}
            </span>
          </div>
          <span className="text-base font-medium leading-5 tracking-4 text-muted-foreground">
            {policy.policyId}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <div className="flex justify-between items-center w-full">
            <div className="flex flex-col">
              <span className="font-medium text-xl leading-6 tracking-4 text-accent-foreground">
                {policy.provider}
              </span>
              <span className="text-muted-foreground text-base font-medium leading-6 tracking-4">
                Coverage:&nbsp;{policy.coverage}
              </span>
            </div>
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
