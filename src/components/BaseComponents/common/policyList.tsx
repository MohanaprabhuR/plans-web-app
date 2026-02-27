import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@/components/ui/avatar";
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
  policyTerm: string;
}

interface PolicyCardProps {
  policy: Policy;
}

const PolicyListCard: React.FC<PolicyCardProps> = ({ policy }) => {
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

  return (
    <Card className={`bg-white min-w-[354px] `}>
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
            </div>
          </div>
          <Button variant="outline" size="lg">
            View Details
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
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PolicyListCard;
