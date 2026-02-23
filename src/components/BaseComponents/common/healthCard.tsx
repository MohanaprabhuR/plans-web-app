import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

interface HealthCardMember {
  id: string;
  policy_number: string;
  full_name: string;
  relationship: string;
  dob: string;
  can_download: boolean;
  avatar: string;
}

const HealthCard = ({ card }: { card: HealthCardMember }) => {
  return (
    <Card className="relative">
      <CardContent>
        <span className="text-base font-medium leading-5 tracking-4 text-accent-foreground absolute -top-3 bg-white px-1.5 left-4">
          #{card.policy_number}
        </span>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-2">
            <Image
              src={card.avatar}
              alt={card.full_name}
              width={48}
              height={48}
              className="object-contain rounded-full overflow-hidden"
            />
            <div className="flex flex-col">
              <span className="text-base font-medium leading-5 tracking-4 text-accent-foreground">
                {card.full_name}
              </span>
              <span className="text-muted-foreground text-base font-medium leading-5 tracking-4">
                {card.relationship} · {card.dob}
              </span>
            </div>
          </div>
          <Button disabled={!card.can_download}>Download</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthCard;
