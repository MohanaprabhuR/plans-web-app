import React from "react";
import { twMerge } from "tailwind-merge";

type IconProps = React.SVGProps<SVGSVGElement> & {
  ariaLabel?: string | false;
};

export const Icon: React.FC<IconProps> = ({
  ariaLabel = false,
  className,
  children,
  viewBox = "0 0 24 24",
  ...props
}) => {
  const isLabeled = typeof ariaLabel === "string" && ariaLabel.length > 0;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      role={isLabeled ? "img" : undefined}
      aria-hidden={isLabeled ? undefined : true}
      focusable={isLabeled ? undefined : false}
      className={twMerge(
        "inline-block h-[1rem] w-[1rem] shrink-0 align-middle leading-[1em]",
        className
      )}
      {...props}
    >
      {isLabeled && <title>{ariaLabel}</title>}
      {children}
    </svg>
  );
};
