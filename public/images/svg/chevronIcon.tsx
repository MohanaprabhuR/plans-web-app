import { Icon } from "@/components/BaseComponents/Icon/page";
import { JSX, SVGProps } from "react";

export const ChevronIcon = (
  props: JSX.IntrinsicAttributes &
    SVGProps<SVGSVGElement> & { ariaLabel?: string | false }
) => (
  <Icon fill="none" viewBox="0 0 12 12" {...props}>
    <path
      d="M4.15821 3.55241C3.95686 3.36365 3.94622 3.04685 4.13477 2.84538C4.32353 2.64403 4.64033 2.63339 4.8418 2.82194L7.8418 5.63444C7.94263 5.72897 8.00001 5.86147 8.00001 5.99968C8.00001 6.13788 7.94263 6.27039 7.8418 6.36491L4.8418 9.17741L4.76172 9.23894C4.56363 9.36071 4.30001 9.33023 4.13477 9.15398C3.96983 8.97773 3.95761 8.71381 4.0918 8.52409L4.15821 8.44694L6.76856 5.99968L4.15821 3.55241Z"
      fill="currentColor"
    />
  </Icon>
);
