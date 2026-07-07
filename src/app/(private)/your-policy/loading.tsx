import { ScreenLoading } from "@/components/ui/screen-loading";

export default function YourPolicyLoading() {
  return (
    <ScreenLoading
      variant="cards-row"
      showHeader={false}
      rows={2}
      label="Loading policies"
      className="pt-2"
    />
  );
}
