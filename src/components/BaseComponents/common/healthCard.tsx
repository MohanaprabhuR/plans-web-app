"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  downloadHealthCard,
  type HealthCardMember,
} from "@/lib/health-card-download";
import { toast } from "sonner";
import Image from "next/image";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { CircleAlert, CircleCheck } from "lucide-react";

const HealthCard = ({ card }: { card: HealthCardMember }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!card.can_download || downloading) return;

    setDownloading(true);
    try {
      await downloadHealthCard(card);
      toast.custom(() => (
        <Alert variant="success">
          <CircleCheck className="size-4" />
          <AlertTitle>Downloaded health card for {card.full_name}.</AlertTitle>
        </Alert>
      ));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to download health card.";

      toast.custom(() => (
        <Alert variant="error">
          <CircleAlert className="size-4" />
          <AlertTitle>Failed to download health card: {message}.</AlertTitle>
        </Alert>
      ));
    } finally {
      setDownloading(false);
    }
  };

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
          <Button
            disabled={!card.can_download || downloading}
            onClick={() => void handleDownload()}
          >
            {downloading ? "Downloading…" : "Download"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthCard;
