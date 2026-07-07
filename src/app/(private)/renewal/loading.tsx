import { ScreenLoading } from "@/components/ui/screen-loading";

export default function RenewalLoading() {
  return (
    <ScreenLoading
      variant="summary"
      showHeader={false}
      statCount={3}
      rows={3}
      label="Loading renewals"
    />
  );
}
