import { Icon } from "@/components/BaseComponents/Icon/page";
import { JSX, SVGProps } from "react";

export const CommandIcon = (
  props: JSX.IntrinsicAttributes &
    SVGProps<SVGSVGElement> & { ariaLabel?: string | false }
) => (
  <Icon fill="none" viewBox="0 0 12 12" {...props}>
    <g clipPath="url(#clip0_63_103159)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.50492 0.537743C5.77828 0.264376 6.2215 0.264376 6.49486 0.537743L11.462 5.5049C11.7354 5.77827 11.7354 6.22148 11.462 6.49485L8.97844 8.97843L6.49486 11.462C6.2215 11.7354 5.77828 11.7354 5.50492 11.462L3.02134 8.97843L0.537758 6.49485C0.264391 6.22148 0.264391 5.77827 0.537758 5.5049L3.02134 3.02132L5.50492 0.537743ZM5.99989 1.45698L3.72844 3.72843L1.457 5.99988L3.72844 8.27132L5.99989 10.5428L8.27134 8.27132L10.5428 5.99988L5.99989 1.45698Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath id="clip0_63_103159">
        <rect width="12" height="12" fill="white" />
      </clipPath>
    </defs>
  </Icon>
);
