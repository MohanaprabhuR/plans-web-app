import React from "react";

interface QuickActionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  icon: React.ReactNode;
}

const QuickActionCard = React.forwardRef<HTMLDivElement, QuickActionCardProps>(
  ({ name, icon, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex flex-col items-center justify-center gap-y-2 w-full max-w-[68px] cursor-pointer ${className}`}
        {...props}
      >
        <div className="flex items-center justify-center size-12 rounded-full bg-[#FFF7ED]">
          {icon}
        </div>

        <p className="text-base font-medium leading-5 text-accent-foreground text-center">
          {name}
        </p>
      </div>
    );
  },
);

QuickActionCard.displayName = "QuickActionCard";

export default QuickActionCard;
