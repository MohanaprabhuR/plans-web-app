import { ScreenLoading } from "@/components/ui/screen-loading";

export default function PlansLoading() {
  return (
    <ScreenLoading
      variant="list"
      showHeader={false}
      rows={3}
      label="Loading plans"
    />
  );
}
